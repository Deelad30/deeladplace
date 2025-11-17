import React, { useState, useEffect } from 'react';
import VendorSelector from './VendorSelector';
import ProductGrid from './ProductGrid';
import ShoppingCart from './ShoppingCart';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { salesService } from '../../services/salesService';
import { useApp } from '../../context/AppContext';
import { jsPDF } from "jspdf";
import SuccessModal from '../modals/SuccessModal';
import SaleOptionsModal from '../modals/SaleOptionsModal';
import PrintModal from '../modals/PrintModal';
import '../../../src/styles/components/POS.css';

const POS = () => {
  const { setVendors: setAppVendors, setProducts: setAppProducts } = useApp();

  // State
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [lastSale, setLastSale] = useState([]);
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

  const calculateCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.vendor_price * item.quantity, 0);
    const commission = cart.reduce((sum, item) => sum + item.commission * item.quantity, 0);
    const total = subtotal + commission;
    return { subtotal, commission, total };
  };

  const calculateLastSaleTotals = () => {
    const subtotal = lastSale.reduce((sum, item) => sum + item.vendor_price * item.quantity, 0);
    const commission = lastSale.reduce((sum, item) => sum + item.commission * item.quantity, 0);
    const total = subtotal + commission;
    return { subtotal, commission, total };
  };


// Sale processing
const finishSale = async (options) => {
  setShowSaleOptions(false);
  setLoading(true);

  try {
    for (const item of cart) {
      // Make sure paymentBreakdown is numbers
      const paymentBreakdown =
        options.payment_type === "multiple" && Array.isArray(options.payment_breakdown)
          ? options.payment_breakdown.map(p => ({
              method: p.method,
              amount: Number(p.amount),
            }))
          : [];

      await salesService.createSale({
        vendor_id: item.vendor_id || selectedVendor,
        product_id: item.id,
        quantity: item.quantity,
        customer_type: options.customer_type,
        payment_type: options.payment_type,
        payment_breakdown: paymentBreakdown
      });
    }

    setLastSale(cart);
    setCart([]);
    setSaleComplete(true);

  } catch (err) {
    console.error('Error finishing sale:', err);
    alert('Error finishing sale');
  } finally {
    setLoading(false);
  }
};


  // Receipt PDF
  const generateReceiptPDF = () => {
    if (!lastSale.length) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 200] });
    let y = 10;
    doc.setFont("monospace");
    doc.setFontSize(10);
    doc.text("Deelad Softwork", 10, y); y += 6;
    doc.text(new Date().toLocaleString(), 10, y); y += 6;
    doc.text("-----------------------------", 10, y); y += 6;

    lastSale.forEach(item => {
      doc.text(`${item.name}`, 10, y); y += 5;
      doc.text(`Qty: ${item.quantity} | ₦${item.vendor_price}`, 10, y); y += 5;
    });

    doc.text("-----------------------------", 10, y); y += 5;
    const totals = calculateLastSaleTotals();
    doc.text(`Subtotal: ₦${totals.subtotal}`, 10, y); y += 5;
    doc.text(`Commission: ₦${totals.commission}`, 10, y); y += 5;
    doc.text(`Total: ₦${totals.total}`, 10, y); y += 5;
    doc.text("-----------------------------", 10, y); y += 5;
    doc.text("Thank you!", 10, y);
    doc.save("receipt.pdf");
  };

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
            // Use onMouseDown instead of onClick to avoid blur before click
            e.preventDefault(); // prevent input blur
            addToCart({ ...product, quantity: 1 }); // ensure quantity key exists
            setSearchTerm("");
            setSearchResults([]);
            setShowDropdown(false);
          }}
          style={{ cursor: "pointer", padding: "5px 10px" }}
        >
          <strong>{product.name}</strong> ({product.vendor_name || "Vendor"}) - ₦{product.vendor_price.toLocaleString()}
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
              generateReceiptPDF();
            }}
          />

          <PrintModal visible={showPrint} onClose={() => setShowPrint(false)}>
            <div id="receipt-print-area">
              <h3>Deelad Softwork</h3>
              <p>{new Date().toLocaleString()}</p>
              <hr />
              {lastSale.map(item => (
                <div key={item.id} style={{ marginBottom: "8px", textAlign: "left" }}>
                  <div>{item.name}</div>
                  <div>Qty: {item.quantity} | ₦{item.vendor_price}</div>
                </div>
              ))}
              <hr />
              <p>Subtotal: ₦{calculateLastSaleTotals().subtotal}</p>
              <p>Commission: ₦{calculateLastSaleTotals().commission}</p>
              <p>Total: ₦{calculateLastSaleTotals().total}</p>
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
