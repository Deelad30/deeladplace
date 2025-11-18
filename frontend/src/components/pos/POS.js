import React, { useState, useEffect } from 'react';
import VendorSelector from './VendorSelector';
import ProductGrid from './ProductGrid';
import ShoppingCart from './ShoppingCart';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { salesService } from '../../services/salesService';
import { useApp } from '../../context/AppContext';
import SuccessModal from '../modals/SuccessModal';
import SaleOptionsModal from '../modals/SaleOptionsModal';
import PrintModal from '../modals/PrintModal';
import '../../../src/styles/components/POS.css';

const currency = (n) =>
  typeof n === 'number' ? `₦${n.toLocaleString(undefined)}` : `₦${Number(n || 0).toLocaleString()}`;

const POS = () => {
  const { setVendors: setAppVendors, setProducts: setAppProducts } = useApp();

  // State
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [lastSale, setLastSale] = useState(null); // now an object when a sale completes
  const [loading, setLoading] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [showSaleOptions, setShowSaleOptions] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all vendors
  const fetchVendors = async () => {
    try {
      const response = await vendorService.getAllVendors();
      setVendors(response.data.vendors);
      setAppVendors(response.data.vendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(response.data.products);
      setAppProducts(response.data.products);
    } catch (err) {
      console.error('Error fetching all products:', err);
    }
  };

  // Fetch products by vendor
  const fetchProductsByVendor = async (vendorId) => {
    try {
      const response = await productService.getProductsByVendor(vendorId);
      setProducts(response.data.products);
      setAppProducts(response.data.products);
    } catch (err) {
      console.error('Error fetching products by vendor:', err);
    }
  };

  // On component mount
  useEffect(() => {
    fetchVendors();
    fetchAllProducts();
  }, []);

  // When selected vendor changes
  useEffect(() => {
    if (selectedVendor) {
      fetchProductsByVendor(selectedVendor);
    } else {
      fetchAllProducts();
    }
  }, [selectedVendor]);

  // Search handler
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const results = products.filter(product =>
      product.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  };

  // Cart operations
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const calculateCartTotals = (items = cart) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.vendor_price) || 0) * item.quantity, 0);
    const commission = items.reduce((sum, item) => sum + (Number(item.commission) || 0) * item.quantity, 0);
    const total = subtotal + commission;
    return { subtotal, commission, total };
  };

  // Sale processing
  const finishSale = async (options) => {
    setShowSaleOptions(false);
    setLoading(true);

    try {
      // Build payment breakdown normalised
      const paymentBreakdown =
        options.payment_type === "multiple" && Array.isArray(options.payment_breakdown)
          ? options.payment_breakdown.map(p => ({
              method: p.method,
              amount: Number(p.amount),
            }))
          : options.payment_type === "single"
            ? [{ method: options.payment_method || "cash", amount: Number(options.amount || 0) }]
            : [];

      // Create sales in backend (existing logic) - we keep doing per item for existing API.
      for (const item of cart) {
        await salesService.createSale({
          vendor_id: item.vendor_id || selectedVendor,
          product_id: item.id,
          quantity: item.quantity,
          customer_type: options.customer_type,
          payment_type: options.payment_type,
          payment_breakdown: paymentBreakdown
        });
      }

      // Prepare lastSale object for printing
      const saleObj = {
        items: cart.map(i => ({ ...i })), // copy items
        payment: {
          type: options.payment_type,
          breakdown: paymentBreakdown,
          customer_type: options.customer_type
        },
        totals: calculateCartTotals(cart),
        date: new Date().toISOString()
      };

      setLastSale(saleObj);
      setCart([]);
      setSaleComplete(true);
    } catch (err) {
      console.error('Error finishing sale:', err);
      alert('Error finishing sale');
    } finally {
      setLoading(false);
    }
  };

  // Print: open a new window with receipt HTML + CSS optimized for 80mm and call print()
  const openPrintWindow = (sale = lastSale) => {
    if (!sale || !sale.items || sale.items.length === 0) return;

    const win = window.open('', 'PRINT', 'height=800,width=400');
    const saleDate = new Date(sale.date || Date.now());
    const formattedDate = saleDate.toLocaleString();

    const itemsHtml = sale.items.map(item => {
      const name = item.name || 'Item';
      console.log(item);
      
      const vendorName = item.vendor_name || item.vendor || 'Vendor';
      const qty = item.quantity || 1;
      const price = Number(item.customerPrice || 0);
      const lineTotal = (price * qty);
      // item line (name on first line, vendor on second, qty & price on right)
      return `
        <div class="line-item">
          <div class="item-left">
            <div class="item-name">${escapeHtml(name)}</div>
            <div class="item-vendor"> </div>
          </div>
          <div class="item-right">
            <div class="item-qty">x${qty}</div>
            <div class="item-price">${currency(lineTotal)}</div>
          </div>
        </div>
      `;
    }).join('');

    const paymentHtml = (sale.payment && Array.isArray(sale.payment.breakdown) && sale.payment.breakdown.length)
      ? sale.payment.breakdown.map(p => `<div class="pay-row"><div class="pay-method">${escapeHtml(capitalize(p.method))}</div><div class="pay-amt">${currency(p.amount)}</div></div>`).join('')
      : `<div class="pay-row"><div class="pay-method">${escapeHtml(capitalize(sale.payment?.type || 'Cash'))}</div><div class="pay-amt">${currency(sale.totals.total)}</div></div>`;

    // Build HTML
    const html = `
      <html>
        <head>
          <title>Receipt</title>
          <meta charset="utf-8" />
         <style>
  @page {
    size: 80mm 100%;
    margin: 0;
  }

  html, body {
    width: 80mm;
    margin: 0;
    padding: 0;
    font-family: "monospace", "Courier New", monospace;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    overflow: visible !important;
  }

  .receipt {
    width: 100%;
    box-sizing: border-box;
    padding: 4mm 3mm;
  }

  .center { text-align:center; }
  .logo-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    border: 1px dashed #999;
    display: inline-block;
    margin-bottom: 6px;
    line-height: 60px;
    font-size: 10px;
    color: #666;
  }
  h2.store {
    font-size: 12px;
    margin: 4px 0;
  }
  .meta { font-size: 9px; margin-bottom: 6px; }
  .sep { border-top: 1px dashed #444; margin: 4px 0; }

  .line-item {
    display:flex;
    justify-content:space-between;
    font-size: 10px;
    margin-bottom: 4px;
    white-space: nowrap;
  }

  .item-left { text-align:left; max-width: 54mm; }
  .item-right { text-align:right; min-width: 20mm; }
  .item-name { font-weight: 600; }
  .item-vendor { font-size: 9px; color: #444; }

  .totals { font-size: 10px; margin-top:6px; }
  .totals .row { display:flex; justify-content:space-between; margin:2px 0; }

  .payment { margin-top:8px; font-size: 10px; }
  .pay-row { display:flex; justify-content:space-between; margin:2px 0; }

  .thankyou { margin-top:10px; text-align:center; font-size:10px; }
  .small { font-size:9px; color:#333; }
</style>

        </head>
        <body>
          <div class="receipt">
            <div class="center">
              <div class="logo-placeholder">LOGO</div>
              <h2 class="store">Deelad Softwork</h2>
              <div class="meta">${formattedDate}</div>
              <div class="meta"><span style="font-weight:700">Customer Type:</span> ${escapeHtml(capitalize(sale.payment?.customer_type || 'Walk-in'))}</div>
            </div>

            <div class="sep"></div>

            ${itemsHtml}

            <div class="sep"></div>

            <div class="totals">

              <div class="row" style="font-weight:700;"><div>TOTAL</div><div>${currency(sale.totals.total)}</div></div>
            </div>

            <div class="sep"></div>

            <div class="payment">
              <div style="font-weight:700; margin-bottom:4px;">PAYMENT</div>
              ${paymentHtml}
            </div>

            <div class="sep"></div>

            <div class="thankyou">
              <div>Thank you for shopping!</div>
              <div class="small">Powered by Deelad Softwork</div>
            </div>

          </div>
        </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();

    // Give the new window a tiny moment to render before printing
    win.focus();
    // print dialog will show
    win.print();

    // Optionally close after print. Some browsers block closing windows opened by script after print.
    // win.close();
  };

  // Helpers
  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function capitalize(s) {
    if (!s) return s;
    return String(s).charAt(0).toUpperCase() + String(s).slice(1);
  }

  return (
    <div className="pos-container">
      <div className="pos-header">
        <h2>Point of Sale</h2>
        <VendorSelector
          vendors={vendors}
          selectedVendor={selectedVendor}
          onVendorSelect={setSelectedVendor}
        />
      </div>

      {/* Search Input */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowDropdown(searchResults.length > 0)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="search-input"
        />
        {showDropdown && searchResults.length > 0 && (
          <ul className="search-dropdown">
            {searchResults.map((product) => (
              <li
                key={product.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addToCart({ ...product, quantity: 1 });
                  setSearchTerm("");
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                style={{ cursor: "pointer", padding: "5px 10px" }}
              >
                <strong>{product.name}</strong> ({product.vendor_name || "Vendor"}) - ₦{Number(product.vendor_price || 0).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pos-content">
        <div className="products-section">
          <ProductGrid
            products={products}
            onAddToCart={addToCart}
            disabled={products.length === 0}
          />
        </div>

        <div className="cart-section">
          <ShoppingCart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            totals={calculateCartTotals()}
            onContinue={() => setShowSaleOptions(true)}
            processing={loading}
            disabled={cart.length === 0}
          />

          <SuccessModal
            visible={saleComplete}
            onClose={() => setSaleComplete(false)}
            onPrint={() => {
              setSaleComplete(false);
              // Trigger print dialog and preview using the saved lastSale
              openPrintWindow(lastSale);
            }}
          />

          {/* If you still want a preview modal inside the app, you can leave PrintModal.
              We won't rely on it for printing; instead we use openPrintWindow to call print() */}
          <PrintModal visible={showPrint} onClose={() => setShowPrint(false)}>
            <div id="receipt-print-area">
              <h3>Deelad Softwork</h3>
              <p>{new Date().toLocaleString()}</p>
              <hr />
              {lastSale?.items?.map(item => (
                <div key={item.id} style={{ marginBottom: "8px", textAlign: "left" }}>
                  <div>{item.name} ({item.vendor_name || item.vendor || 'Vendor'})</div>
                  <div>Qty: {item.quantity} | ₦{Number(item.vendor_price).toLocaleString()}</div>
                </div>
              )) || <p>No last sale</p>}
              <hr />
              <p>Subtotal: ₦{calculateCartTotals(lastSale?.items || []).subtotal}</p>
              <p>Commission: ₦{calculateCartTotals(lastSale?.items || []).commission}</p>
              <p>Total: ₦{calculateCartTotals(lastSale?.items || []).total}</p>
              <hr />
              <p>Thank you!</p>
            </div>
          </PrintModal>

          <SaleOptionsModal
            visible={showSaleOptions}
            onClose={() => setShowSaleOptions(false)}
            onFinish={finishSale}
            totals={calculateCartTotals()}
          />
        </div>
      </div>
    </div>
  );
};

export default POS;
