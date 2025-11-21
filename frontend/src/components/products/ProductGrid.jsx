import ProductCard from './ProductCard';

const ProductGrid = ({ vendors, onEdit, onDelete }) => {
  // Log all products for each vendor
  vendors.forEach(vendor => {
    //console.log(`Vendor: ${vendor.vendor_id}`, vendor.products);
  });

  return (
    <div className="product-grid">
      {vendors.map((vendor) => (
        <div key={vendor.vendor_id} className="vendor-section">
          <h3>{vendor.vendor_name}</h3>
          <div className="vendor-products">
            {vendor.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={() => onDelete(vendor.vendor_id, product.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
