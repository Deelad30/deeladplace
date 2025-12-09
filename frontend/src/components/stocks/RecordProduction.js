import { useEffect, useState } from "react";
import api from "../../api/axios";
import { recordProductionAPI } from "../../api/movements";
import { toast } from "react-hot-toast";

export default function RecordProduction() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qtyProduced, setQtyProduced] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products/all");
      setProducts(res.data.products || []); // show all products
      console.log(res);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    }
  };

const onProductChange = (id) => {
  const product = products.find(p => p.id === Number(id));
  setSelectedProduct(product);
};

  const onQtyChange = (val) => {
    const q = Number(val);
    setQtyProduced(q >= 1 ? q : 1);
  };

  const submitProduction = async () => {
  if (!selectedProduct) {
    toast.error("Please select a product");
    return;
  }

  try {
    await recordProductionAPI(
      selectedProduct.id,
      qtyProduced,
      null,
      `PROD-${selectedProduct.id}`
    );

    toast.success("Production recorded successfully!");
    setSelectedProduct(null);
    setQtyProduced(1);

  } catch (err) {
    console.error(err);
    toast.error("Failed to record production");
  }
};


  return (
    <div className="page">
      <h2>Record Production</h2>

      {/* Product Select */}
      <div>
        <label>Product</label>
        <select
          value={selectedProduct?.id || ""}
          onChange={(e) => onProductChange(e.target.value)}
        >
          <option value="">Select product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div style={{ marginTop: 10 }}>
        <label>Quantity Produced</label>
        <input
          type="number"
          value={qtyProduced}
          min={1}
          onChange={(e) => onQtyChange(e.target.value)}
        />
      </div>

      <button
        style={{ marginTop: 20 }}
        onClick={submitProduction}
        disabled={!selectedProduct} // disable if nothing selected
      >
        Record Production
      </button>
    </div>
  );
}
