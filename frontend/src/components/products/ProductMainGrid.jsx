import ProductCard from './ProductCard';

const ProductMainGrid = ({ vendors, onEdit, onDelete }) => {
  // Log all products for each vendor
  vendors.forEach(vendor => {
    //console.log(`Vendor: ${vendor.vendor_id}`, vendor.products);
  });

  return (
    <div className="product-grid-1">
      {vendors.map((vendor) => (
        <div key={vendor.vendor_id} className="vendor-section">
          <h3
  style={{
    fontSize: "23px",
    color: "rgb(217, 31, 34)",
    borderBottom: "5px solid rgb(22, 163, 74)",
    display: "inline-block",
    marginTop: "20px",
  }}
>
 Vendor: {vendor.vendor_name}
</h3>
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

export default ProductMainGrid;
