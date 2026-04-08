import React, { useState, useEffect, useCallback } from 'react';
import { getUser } from '../../api/users';
import ProductGrid from './ProductGrid';
import ShoppingCart from './ShoppingCart';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { recordSale, closeShift, openShift, listPOSProducts  } from '../../api/pos';
import { useApp } from '../../context/AppContext';
import ProductGridSkeleton from './ProductGridSkeleton';
import SuccessModal from '../modals/SuccessModal';
import {
  getProducts,
} from '../../api/products';
import SaleOptionsModal from '../modals/SaleOptionsModal';
import ActiveBillsModal from './ActiveBillsModal';
import { saveBill, getBillDetails, settleBill as settleBillApi, getActiveBills } from '../../api/pos';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { openPrintWindow } from '../../utils/printHelpers';
import { roundPrice } from '../../utils/formatters';
import '../../../src/styles/components/POS.css';

const currency = (n) =>
  typeof n === 'number' ? `₦${n.toLocaleString(undefined)}` : `₦${Number(n || 0).toLocaleString()}`;

const POS = () => {
  const { setVendors: setAppVendors, setProducts: setAppProducts } = useApp();

    const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  // State
  const [activeTab, setActiveTab] = useState('order'); // 'order' or 'bills'
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [lastSale, setLastSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSkeleton, setLoadingSkeleton] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [showSaleOptions, setShowSaleOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentShiftId, setCurrentShiftId] = useState(null);
  const [billNo, setBillNo] = useState("");
  const [activeBillId, setActiveBillId] = useState(null);
  const [activeBillsCount, setActiveBillsCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  const round = roundPrice;
  


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

  const fetchActiveBillsCount = useCallback(async () => {
    try {
      const res = await getActiveBills();
      setActiveBillsCount(res.data.bills.length);
    } catch (err) {
      console.error('Failed to fetch bills count', err);
    }
  }, []);

  const fetchAllProducts = useCallback(async () => {
  setLoadingSkeleton(true); 
  try {
    const res = await getProducts(1, 1000); // fetch all products in one go
    const allProducts = res.data.products;
    setProducts(allProducts);
    setAppProducts(allProducts);
  } catch (err) {
    console.error(err);
    toast.error('Failed to fetch products');
  } finally{
     setLoadingSkeleton(false); 
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
    fetchActiveBillsCount();

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
    const commissionValue = Number(product.commission || product.custom_commission || 0);
    
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, commission: commissionValue, quantity: 1 }]);
    }
  };
  const removeFromCart = (productId) => setCart(cart.filter(item => item.id !== productId));
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const calculateCartTotals = (items = cart) => {
    const totalSellingPrice = items.reduce((sum, item) => sum + (Number(round(item.selling_price)) || 0) * item.quantity, 0);
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

  const handleSaveBill = async () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (!billNo) return toast.error("Please enter a Table/Bill Number");

    // Client-side uniqueness check (for new bills)
    if (!activeBillId) {
      try {
        const res = await getActiveBills();
        const activeBills = res.data.bills;
        const isDuplicate = activeBills.some(b => b.bill_no?.trim().toLowerCase() === billNo.trim().toLowerCase());
        if (isDuplicate) {
          return toast.error(`Table Name "${billNo}" is already in use.`);
        }
      } catch (err) {
        console.error("Uniqueness check failed", err);
      }
    }

    setLoading(true);
    const saveTask = saveBill({
      bill_id: activeBillId,
      bill_no: billNo,
      items: cart.map(i => ({
        product_id: i.id,
        qty: i.quantity,
        selling_price: round(i.selling_price),
        commission: i.commission || 0
      }))
    });

    toast.promise(saveTask, {
      loading: activeBillId ? 'Updating bill...' : 'Saving bill...',
      success: (res) => {
        setCart([]);
        setBillNo("");
        setActiveBillId(null);
        return activeBillId ? 'Bill updated successfully' : 'Bill saved successfully';
      },
      error: (err) => err.response?.data?.message || 'Failed to save bill'
    });

    try {
      await saveTask;
      fetchActiveBillsCount();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBill = () => {
    if (!cart.length) return toast.error("Cart is empty");
    const saleData = {
      bill_no: billNo,
      items: cart,
      date: new Date().toISOString(),
      payment: { customer_type: "walk-in" } // Default for bill estimation
    };
    openPrintWindow(saleData, vendors, { isBill: true });
  };

  const handlePrintKitchen = () => {
    if (!cart.length) return toast.error("Cart is empty");
    const saleData = {
      bill_no: billNo,
      items: cart,
      date: new Date().toISOString()
    };
    openPrintWindow(saleData, vendors, { isKitchenCopy: true });
  };

  const handlePrintActiveBill = async (id) => {
    try {
      const res = await getBillDetails(id);
      const { bill, items } = res.data;
      const saleData = {
        bill_no: bill.bill_no,
        items: items.map(i => ({ ...i, name: i.product_name, selling_price: Number(i.selling_price), commission: Number(i.commission) })),
        date: bill.created_at,
        payment: { customer_type: "walk-in" }
      };
      openPrintWindow(saleData, vendors, { isBill: true });
    } catch (err) {
      console.error(err);
      toast.error('Failed to print bill');
    }
  };

  const handlePrintActiveKitchen = async (id) => {
    try {
      const res = await getBillDetails(id);
      const { bill, items } = res.data;
      const saleData = {
        bill_no: bill.bill_no,
        items: items.map(i => ({ ...i, name: i.product_name, selling_price: Number(i.selling_price), commission: Number(i.commission) })),
        date: bill.created_at
      };
      openPrintWindow(saleData, vendors, { isKitchenCopy: true });
    } catch (err) {
      console.error(err);
      toast.error('Failed to print kitchen copy');
    }
  };

  const handleLoadBill = async (id) => {
    setLoadingCart(true);
    setLoading(true);
    try {
      const res = await getBillDetails(id);
      const { bill, items } = res.data;
      
      setBillNo(bill.bill_no);
      setActiveBillId(bill.id);
      
      // Map items back to cart format
      const loadedCart = items.map(item => ({
        id: item.product_id,
        name: item.product_name,
        quantity: Number(item.qty),
        selling_price: Number(item.selling_price),
        commission: Number(item.commission || item.custom_commission || 0),
        vendor_id: item.vendor_id 
      }));
      
      setCart(loadedCart);
      toast.success('Bill loaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bill');
    } finally {
      setLoading(false);
      setLoadingCart(false);
    }
  };

  // --- Finish Sale ---
const finishSale = async (options) => {
  if (!cart.length) {
    toast.error('No items in cart');
    return;
  }
  setShowSaleOptions(false);
  setLoading(true);

  const transaction_id = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Total amount of cart including commissions (USE ROUNDED PRICES & QTY MULTIPLICATION)
  const totalCartAmount = cart.reduce(
    (sum, item) => sum + (Number(round(item.selling_price)) + Number(item.commission || 0)) * item.quantity,
    0
  );
  
  
  

  const saleObj = {
    items: cart.map(i => ({ ...i })),
    payment: {
      type: options.payment_type,
      breakdown: options.payment_type === 'multiple' && Array.isArray(options.payment_breakdown)
        ? options.payment_breakdown.map(p => ({ method: p.method, amount: Number(p.amount) }))
        : [{ method: options.payment_type || 'cash', amount: totalCartAmount }],
      customer_type: options.customer_type
    },
    totals: calculateCartTotals(cart),
    date: new Date().toISOString(),
    selectedVendor,
    transaction_id
  };  
  const saleTask = (async () => {
    if (isOnline) {
      if (activeBillId) {
        await settleBillApi(activeBillId, {
          payment_method: options.payment_type,
          payment_breakdown: options.payment_type === 'multiple' ? options.payment_breakdown : [{ method: options.payment_type || 'cash', amount: totalCartAmount }],
          order_method: options.customer_type === "walk-in" ? "walk-in" : "online",
          shift_id: currentShiftId
        });
      } else {
        for (const item of cart) {
          const itemTotal = (Number(round(item.selling_price)) + Number(item.commission || 0)) * item.quantity;
          let itemPaymentBreakdown = [];
          if (options.payment_type === 'multiple' && Array.isArray(options.payment_breakdown)) {
            itemPaymentBreakdown = options.payment_breakdown.map(p => ({
              method: p.method,
              amount: Math.round((Number(p.amount) / totalCartAmount) * itemTotal)
            }));
          } else {
            itemPaymentBreakdown = [{ method: options.payment_type || 'cash', amount: itemTotal }];
          }

          await recordSale({
            product_id: item.id,
            qty: item.quantity,
            selling_price: Number(round(item.selling_price)),
            commission: Number(item.commission || 0),
            vendor_id: item.vendor_id || selectedVendor,
            shift_id: currentShiftId,
            order_method: options.customer_type === "walk-in" ? "walk-in" : "online",
            payment_method: options.payment_type,
            payment_breakdown: itemPaymentBreakdown,
            transaction_id: transaction_id
          });
        }
      }
    } else {
      savePendingSale(saleObj);
    }
  })();

  toast.promise(saleTask, {
    loading: 'Processing transaction...',
    success: 'Sale completed successfully!',
    error: 'Error finishing sale'
  });

  try {
    await saleTask;
    fetchActiveBillsCount();
    setLastSale(saleObj);
    setCart([]);
    setBillNo('');
    setActiveBillId(null);
    setSaleComplete(true);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  // --- Close Shift & Download PDF ---
const handleCloseShift = async () => {
  const closeTask = (async () => {
    const res = await closeShift({ shift_id: currentShiftId });
    return res;
  })();

  toast.promise(closeTask, {
    loading: 'Generating shift report...',
    success: 'Report generated successfully',
    error: 'Failed to close shift'
  });

  try {
    const res = await closeTask;

    const shiftSales = res.data.sales || [];
    const staffName = res.data.staff_name || "N/A";
    const paymentTotals = res.data.payment_totals || { cash: 0, transfer: 0, card: 0 };

    if (!shiftSales.length) {
      toast.info("No sales recorded for this shift");
      return;
    }

    // Create PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Shift Report", 14, 20);

    // Header
    doc.setFontSize(12);
    doc.text(`Shift ID: ${currentShiftId}`, 14, 28);
    doc.text(`Staff Name: ${staffName}`, 14, 34);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 40);

    // Optional: Sales Table for auditing
    if (shiftSales.length) {
      const tableColumns = ["#", "Product", "Qty", "Price (₦)", "Commission (₦)", "Total (₦)", "Time"];
      const tableRows = shiftSales.map((sale, i) => {
        const total = (Number(sale.selling_price) + Number(sale.commission || 0)) * Number(sale.qty);
        return [
          i + 1,
          sale.product_name,
          sale.qty,
          Number(sale.selling_price).toLocaleString(),
          Number(sale.commission || 0).toLocaleString(),
          total.toLocaleString(),
          new Date(sale.created_at).toLocaleTimeString()
        ];
      });

      autoTable(doc, {
        startY: 48,
        head: [tableColumns],
        body: tableRows,
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: 14, right: 14 }
      });
    }

    // Payment Summary
    const finalY = doc.lastAutoTable?.finalY + 10 || 60;
    
    // Use exact totals for the report (already rounded to whole numbers during sale)
    const rCash = Number(paymentTotals.cash || 0);
    const rTransfer = Number(paymentTotals.transfer || 0);
    const rCard = Number(paymentTotals.card || 0);
    
    // Ensure grand total is a clean integer (Sum of Cash, Transfer, and Card)
    const grandTotal = Math.round(rCash + rTransfer + rCard);

    doc.setFontSize(14);
    doc.text("Payment Summary", 14, finalY);



autoTable(doc, {
  startY: finalY + 5,
  head: [[
    { content: "Method", styles: { halign: 'left' } },
    { content: "Amount (₦)", styles: { halign: 'right' } }
  ]],
  body: [
    ["Cash", rCash.toLocaleString()],
    ["Transfer", rTransfer.toLocaleString()],
    ["Card", rCard.toLocaleString()],
    [{ content: "Grand Total", styles: { fontStyle: 'bold' } }, { content: grandTotal.toLocaleString(), styles: { fontStyle: 'bold' } }]
  ],
  theme: 'striped',
  styles: { fontSize: 11, cellPadding: 3 },
  columnStyles: { 
    0: { cellWidth: 60 },      
    1: { halign: 'right' }  
  },
  margin: { left: 14, right: 14 }
});

    // Save PDF
    doc.save(`shift_${currentShiftId}.pdf`);

    // Clear shift
    localStorage.removeItem("current_shift_id");
    setCurrentShiftId(null);
    toast.success("Shift closed and PDF downloaded");

  } catch (err) {
    console.error(err);
    toast.error("Failed to close shift");
  }
};
  return (
    <div className="pos-container">
      <div className="pos-tabs">
        <button 
          className={`pos-tab ${activeTab === 'order' ? 'active' : ''}`}
          onClick={() => setActiveTab('order')}
        >
          New Order
        </button>
        <button 
          className={`pos-tab ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          Manage Bills {activeBillsCount > 0 && <span className="bill-count-badge">{activeBillsCount}</span>}
        </button>
      </div>

      <div className="pos-tab-content">
        {activeTab === 'order' ? (
          <div className="pos-content">
            <div className="pos-controls">
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
                      <li key={product.id} onMouseDown={() => { addToCart({ ...product, quantity: 1 }); setSearchTerm(''); setSearchResults([]); setShowDropdown(false); }} style={{ cursor: "pointer", padding: "10px" }}>
                        <strong>{product.name}</strong> - {getVendorName(product.vendor_id)} - {currency(Number(round(product.selling_price || 0)) + Number(product.commission || product.custom_commission || 0))}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="print-btn-glass" 
                  onClick={handleCloseShift} 
                  disabled={!currentShiftId}
                  style={{ padding: '0.75rem 1.25rem', height: 'auto', border: '1px solid var(--pos-border)' }}
                >
                  End Shift
                </button>
              </div>
            </div>

            <div className="products-section">
              {loadingSkeleton ? (
                <ProductGridSkeleton count={12} />
              ) : (
                <ProductGrid
                  products={products}
                  onAddToCart={addToCart}
                  disabled={!products.length}
                  vendors={vendors}
                />
              )}
            </div>

            <div className="cart-section">
              <ShoppingCart
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                totals={calculateCartTotals()}
                onContinue={() => setShowSaleOptions(true)}
                processing={loading}
                loading={loadingCart}
                disabled={!cart.length}
                billNo={billNo}
                onBillNoChange={setBillNo}
                onSaveBill={handleSaveBill}
                onPrintBill={handlePrintBill}
                onPrintKitchen={handlePrintKitchen}
              />
            </div>
          </div>
        ) : (
          <div className="pos-content-bills">
            <ActiveBillsModal 
              standalone={true}
              visible={true} 
              onClose={() => setActiveTab('order')} 
              onLoadBill={(id) => { handleLoadBill(id); setActiveTab('order'); }} 
              onPrintBill={handlePrintActiveBill}
              onPrintKitchen={handlePrintActiveKitchen}
              onRefresh={fetchActiveBillsCount}
            />
          </div>
        )}
      </div>

      <SuccessModal
        visible={saleComplete}
        onClose={() => setSaleComplete(false)}
        onPrint={() => { setSaleComplete(false); openPrintWindow(lastSale, vendors); }}
      />
      <SaleOptionsModal visible={showSaleOptions} onClose={() => setShowSaleOptions(false)} onFinish={finishSale} totals={calculateCartTotals()} />
    </div>
  );
};

export default POS;
