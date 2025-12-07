import React, { useState, useEffect, useCallback } from 'react';
import VendorSelector from './VendorSelector';
import ProductGrid from './ProductGrid';
import ShoppingCart from './ShoppingCart';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { recordSale, closeShift, openShift  } from '../../api/pos';
import { useApp } from '../../context/AppContext';
import SuccessModal from '../modals/SuccessModal';
import SaleOptionsModal from '../modals/SaleOptionsModal';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [lastSale, setLastSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [showSaleOptions, setShowSaleOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentShiftId, setCurrentShiftId] = useState(null);

  const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;

 useEffect(() => {
  async function initShift() {
    try {
      const res = await openShift();
      const shiftId = res.data.shift.id;

      setCurrentShiftId(shiftId);
      localStorage.setItem('current_shift_id', shiftId);

      toast.success('Shift started successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to open shift');
    }
  }

  initShift();
}, []);


  // --- Fetch Vendors & Products ---
  const fetchVendors = useCallback(async () => {
    try {
      const res = await vendorService.getAllVendors();
      setVendors(res.data.vendors);
      setAppVendors(res.data.vendors);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch vendors');
    }
  }, [setAppVendors]);

  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await productService.getAllProducts();
      setProducts(res.data.products);
      setAppProducts(res.data.products);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch products');
    }
  }, [setAppProducts]);

  const fetchProductsByVendor = useCallback(async (vendorId) => {
    try {
      const res = await productService.getProductsByVendor(vendorId);
      setProducts(res.data.products);
      setAppProducts(res.data.products);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch vendor products');
    }
  }, [setAppProducts]);

  // --- Initialize POS ---
  useEffect(() => {
    fetchVendors();
    fetchAllProducts();

    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const savedShift = localStorage.getItem('current_shift_id');
    if (savedShift) setCurrentShiftId(savedShift);

    if (navigator.onLine) syncPendingSales();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
     // eslint-disable-next-line 
  }, [fetchVendors, fetchAllProducts]);

  useEffect(() => {
    if (selectedVendor) fetchProductsByVendor(selectedVendor);
    else fetchAllProducts();
  }, [selectedVendor, fetchProductsByVendor, fetchAllProducts]);

  // --- Search ---
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

  // --- Cart Operations ---
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };
  const removeFromCart = (productId) => setCart(cart.filter(item => item.id !== productId));
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const calculateCartTotals = (items = cart) => {
    const totalSellingPrice = items.reduce((sum, item) => sum + (Number(item.selling_price) || 0) * item.quantity, 0);
    const totalCommission = items.reduce((sum, item) => sum + (Number(item.commission) || 0) * item.quantity, 0);
    return { totalSellingPrice, totalCommission, total: totalSellingPrice + totalCommission };
  };

  // --- Offline / Pending Sales ---
  const savePendingSale = (sale) => {
    const pending = JSON.parse(localStorage.getItem('pending_sales') || '[]');
    pending.push(sale);
    localStorage.setItem('pending_sales', JSON.stringify(pending));
    toast.success('Sale saved locally and will sync when online');
  };

  const syncPendingSales = async () => {
    const pending = JSON.parse(localStorage.getItem('pending_sales') || '[]');
    if (!pending.length) return;

    for (const sale of pending) {
      for (const item of sale.items) {
        try {
          await recordSale({
            product_id: item.id,
            qty: item.quantity,
            selling_price: Number(item.selling_price),
            payment_method: sale.payment.type,
            payment_breakdown: sale.payment.breakdown,
            order_method: sale.payment.customer_type === "walk-in" ? "walk-in" : "online",
            vendor_id: item.vendor_id || sale.selectedVendor,
            commission: Number(item.commission || 0),
            shift_id: currentShiftId
          });
        } catch (err) {
          console.error('Failed to sync sale', sale, err);
          continue;
        }
      }
    }
    localStorage.setItem('pending_sales', '[]');
    toast.success('Offline sales synced successfully!');
  };

  // --- Finish Sale ---
const finishSale = async (options) => {
  if (!cart.length) {
    toast.error('No items in cart');
    return;
  }
  setShowSaleOptions(false);
  setLoading(true);

  // Total amount of cart including commissions
  const totalCartAmount = cart.reduce(
    (sum, item) => sum + Number(item.selling_price) * item.quantity + Number(item.commission || 0),
    0
  );

  const saleObj = {
    items: cart.map(i => ({ ...i })),
    payment: {
      type: options.payment_type,
      breakdown: options.payment_type === 'multiple' && Array.isArray(options.payment_breakdown)
        ? options.payment_breakdown.map(p => ({ method: p.method, amount: Number(p.amount) }))
        : [{ method: options.payment_method || 'cash', amount: totalCartAmount }],
      customer_type: options.customer_type
    },
    totals: calculateCartTotals(cart),
    date: new Date().toISOString(),
    selectedVendor
  };

  try {
    if (isOnline) {
      for (const item of cart) {
        // Calculate individual item total including commission
        const itemTotal = Number(item.selling_price) * item.quantity + Number(item.commission || 0);
        
        // Proportional payment breakdown per item
        let itemPaymentBreakdown = [];
        if (options.payment_type === 'multiple' && Array.isArray(options.payment_breakdown)) {
          itemPaymentBreakdown = options.payment_breakdown.map(p => ({
            method: p.method,
            amount: (Number(p.amount) / totalCartAmount) * itemTotal
          }));
        } else {
          itemPaymentBreakdown = [{ method: options.payment_method || 'cash', amount: itemTotal }];
        }

        await recordSale({
          product_id: item.id,
          qty: item.quantity,
          selling_price: Number(item.selling_price),
          commission: Number(item.commission || 0),
          vendor_id: item.vendor_id || selectedVendor,
          shift_id: currentShiftId,
          order_method: options.customer_type === "walk-in" ? "walk-in" : "online",
          payment_method: options.payment_type,
          payment_breakdown: itemPaymentBreakdown,
        });
      }
      toast.success('Sale completed successfully!');
    } else {
      savePendingSale(saleObj);
    }

    setLastSale(saleObj);
    setCart([]);
    setSaleComplete(true);
  } catch (err) {
    console.error(err);
    toast.error('Error finishing sale');
  } finally {
    setLoading(false);
  }
};


  // --- Print Sale Receipt ---
  const openPrintWindow = (sale = lastSale) => {
    if (!sale) return;
    const win = window.open('', 'PRINT', 'height=800,width=400');
    const formattedDate = new Date(sale.date || Date.now()).toLocaleString();
    const itemsHtml = sale.items.map(item => `
      <div class="line-item">
        <div class="item-left">
          <div class="item-name">${item.name}</div>
        </div>
        <div class="item-right">
          <div class="item-qty">x${item.quantity}</div>
          <div class="item-price">${currency((Number(item.selling_price) || 0) * item.quantity)}</div>
        </div>
      </div>
    `).join('');

    const paymentHtml = sale.payment.breakdown.map(p => `
      <div class="pay-row"><div class="pay-method">${p.method}</div><div class="pay-amt">${currency(round(p.amount))}</div></div>
    `).join('');

    win.document.open();
    win.document.write(`
      <html>
      <head><title>Receipt</title></head>
      <body>
        <div class="receipt">
          <h2>Deelad Softwork</h2>
          <p>${formattedDate}</p>
          ${itemsHtml}
          <hr />
          <div>Total: ${currency(round(sale.totals.total))}</div>
          <div>Payment:</div>
          ${paymentHtml}
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // --- Close Shift & Download PDF ---
const handleCloseShift = async () => {
  if (!currentShiftId) return toast.error("No active shift");

  try {
    // Call backend to close shift and get sales
    const res = await closeShift({ shift_id: currentShiftId });
    const shiftSales = res.data.sales || [];

    if (!shiftSales.length) {
      toast.info("No sales recorded for this shift");
      return;
    }

    // Create PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Shift Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Shift ID: ${currentShiftId}`, 14, 28);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 36);

    // Prepare table
    const tableColumn = ["#", "Product", "Qty", "Price (₦)", "Commission (₦)", "Total (₦)", "Time"];
    const tableRows = shiftSales.map((sale, i) => {
      const total = Number(sale.selling_price) * Number(sale.qty);
      return [
        i + 1,
        sale.product_name,
        sale.qty,
        Number(sale.selling_price).toLocaleString(),
        Number(sale.commission || 0).toLocaleString(),
        (total + Number(sale.commission || 0)).toLocaleString(),
        new Date(sale.created_at).toLocaleTimeString()
      ];
    });

    // Use autoTable
    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 },
    });

    // Calculate totals
    const totalSales = shiftSales.reduce((sum, s) => sum + Number(s.selling_price) * Number(s.qty), 0);
    const totalCommission = shiftSales.reduce((sum, s) => sum + Number(s.commission || 0), 0);
    const grandTotal = totalSales + totalCommission;

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Sales: ₦${totalSales.toLocaleString()}`, 14, finalY);
    doc.text(`Total Commission: ₦${totalCommission.toLocaleString()}`, 14, finalY + 6);
    doc.text(`Grand Total: ₦${grandTotal.toLocaleString()}`, 14, finalY + 12);

    // Save PDF
    doc.save(`shift_${currentShiftId}.pdf`);

    // Clear shift
    localStorage.removeItem('current_shift_id');
    setCurrentShiftId(null);
    toast.success('Shift closed and PDF downloaded');
  } catch (err) {
    console.error(err);
    toast.error('Failed to close shift');
  }
};


  return (
    <div className="pos-container">
      <div className="pos-header">
        <h2>Point of Sale {isOnline ? '' : '(Offline Mode)'}</h2>
        <button onClick={handleCloseShift} disabled={!currentShiftId}>End Shift & Download PDF</button>
      </div>

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
            {searchResults.map(product => (
              <li key={product.id} onMouseDown={() => { addToCart({ ...product, quantity: 1 }); setSearchTerm(''); setSearchResults([]); setShowDropdown(false); }} style={{ cursor: "pointer", padding: "5px 10px" }}>
                <strong>{product.name}</strong> ({product.vendor_name || "Vendor"}) - {currency(Number(product.vendor_price || 0))}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pos-content">
        <div className="products-section">
          <ProductGrid products={products} onAddToCart={addToCart} disabled={!products.length} />
        </div>
        <div className="cart-section">
          <ShoppingCart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            totals={calculateCartTotals()}
            onContinue={() => setShowSaleOptions(true)}
            processing={loading}
            disabled={!cart.length}
          />
          <SuccessModal
            visible={saleComplete}
            onClose={() => setSaleComplete(false)}
            onPrint={() => { setSaleComplete(false); openPrintWindow(lastSale); }}
          />
          <SaleOptionsModal visible={showSaleOptions} onClose={() => setShowSaleOptions(false)} onFinish={finishSale} totals={calculateCartTotals()} />
        </div>
      </div>
    </div>
  );
};

export default POS;
