import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const showCommission =
    product.custom_commission !== null &&
    product.custom_commission !== undefined &&
    Number(product.custom_commission) !== 0;

  return (
    <div style={{ marginTop:'15px', marginBottom:"10px" }} className="product-card">
      <h3>{product.name}</h3>
      
      <p>
        <span style={{ fontWeight: "700" }}>Price:</span> ₦{product.vendor_price}
      </p>

      {showCommission && (
        <p>
          <span style={{ fontWeight: "700" }}>Commission:</span> ₦{product.custom_commission}
        </p>
      )}

  <div className="card-actions">
      <button
        onClick={() => onEdit(product)}
        style={{ marginRight: "10px", display: "flex", alignItems: "center", gap: "5px" }}
      >
        <FontAwesomeIcon icon={faEdit} />
        Edit
      </button>

      <button
        onClick={() => onDelete(product.id)}
        style={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#e53935", color: "#fff" }}
      >
        <FontAwesomeIcon icon={faTrash} />
        Delete
      </button>
    </div>
    </div>
  );
};

export default ProductCard;
