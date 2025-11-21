const ProductCard = ({ product, onEdit, onDelete }) => (
  <div className="product-card">
    <h3>{product.name}</h3>
    <p>Price: ${product.vendor_price}</p>
    <p>Commission: ${product.custom_commission}</p>

    <div className="card-actions">
      <button onClick={() => onEdit(product)}>Edit</button>
      
      {/* FIX: Do NOT pass product.id again */}
      <button onClick={onDelete}>Delete</button>
    </div>
  </div>
);

export default ProductCard;
