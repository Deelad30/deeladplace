import React, { useState, useEffect } from 'react';
import VendorSelector from './VendorSelector';
import ProductGrid from './ProductGrid';
import ShoppingCart from './ShoppingCart';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { salesService } from '../../services/salesService';
import { useApp } from '../../context/AppContext';
import '../../../src/styles/components/POS.css';

const POS = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const { setVendors: setAppVendors, setProducts: setAppProducts } = useApp();

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      fetchProducts(selectedVendor);
    }
  }, [selectedVendor]);

  const fetchVendors = async () => {
    try {
      const response = await vendorService.getAllVendors();
      setVendors(response.data.vendors);
      setAppVendors(response.data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchProducts = async (vendorId) => {
    try {
      const response = await productService.getProductsByVendor(vendorId);
      setProducts(response.data.products);
      setAppProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.vendor_price * item.quantity), 0);
    const commission = cart.reduce((sum, item) => sum + (item.commission * item.quantity), 0);
    const total = subtotal + commission;

    return { subtotal, commission, total };
  };

  const processSale = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      for (const item of cart) {
        await salesService.createSale({
          vendor_id: selectedVendor,
          product_id: item.id,
          quantity: item.quantity
        });
      }
      
      setCart([]);
      alert('Sale processed successfully!');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    } finally {
      setLoading(false);
    }
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

      <div className="pos-content">
        <div className="products-section">
          <ProductGrid
            products={products}
            onAddToCart={addToCart}
            disabled={!selectedVendor}
          />
        </div>

        <div className="cart-section">
          <ShoppingCart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            totals={calculateTotals()}
            onProcessSale={processSale}
            processing={loading}
            disabled={!selectedVendor || cart.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default POS;