import { useEffect, useState } from "react";
import { issueToProductionAPI } from "../../api/movements";
import api from "../../api/axios";
import { toast } from "react-hot-toast"; 

export default function IssueToProduction() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipes, setRecipes] = useState([]); 
  const [qtyToProduce, setQtyToProduce] = useState(1);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await api.get("/products/all");
    setProducts(res.data.products || res.data);
  };

  const loadRecipe = async (productId) => {
    const res = await api.get(`/recipes/${productId}`);
    const recipeRows = res.data.items || [];

    const mapped = recipeRows.map(r => ({
      material_id: r.material_id,
      material_name: r.material_name || `Material ${r.material_id}`,
      base_qty: Number(r.recipe_qty),
      required_qty: Number(r.recipe_qty) * qtyToProduce
    }));

    setRecipes(recipeRows);
    setRows(mapped);
  };

  const onProductChange = (id) => {
    setSelectedProduct(id);
    loadRecipe(id);
  };

  const onQtyChange = (val) => {
    const q = Number(val);
    setQtyToProduce(q);

    setRows(rows =>
      rows.map(r => ({
        ...r,
        required_qty: r.base_qty * q
      }))
    );
  };

  const submitIssue = async () => {
    try {
      const items = rows.map(r => ({
        item_id: r.material_id,
        item_type: "material",
        qty: r.required_qty,
        cost_per_unit: null
      }));

      await issueToProductionAPI(items, `PROD-${selectedProduct}`);
      toast.success("Materials issued successfully!"); // ✅ toast instead of alert
    } catch (err) {
      console.error(err);
      toast.error("Failed to issue materials.");
    }
  };

  return (
    <div className="page">
      <h2>Issue Raw Materials to Production</h2>

      {/* Product Select */}
      <div>
        <label>Product</label>
        <select
          value={selectedProduct || ""}
          onChange={(e) => onProductChange(e.target.value)}
        >
          <option value="">Select product...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div style={{ marginTop: 10 }}>
        <label>Quantity to Produce</label>
        <input
          type="number"
          value={qtyToProduce}
          min={1}
          onChange={(e) => onQtyChange(e.target.value)}
        />
      </div>

      {/* Materials Table */}
      {rows.length > 0 && (
        <table className="table" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Raw Material</th>
              <th>Recipe Qty</th>
              <th>Required Qty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.material_id}>
                <td>{r.material_name}</td>
                <td>{r.base_qty}</td>
                <td>{r.required_qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {rows.length > 0 && (
        <button style={{ marginTop: 20 }} onClick={submitIssue}>
          Issue Materials
        </button>
      )}
    </div>
  );
}
