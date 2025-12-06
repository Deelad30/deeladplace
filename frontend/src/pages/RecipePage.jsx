import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Table from "../components/common/Table";
import Modals from "../components/common/Modals";

import {
  getRecipe,
  addRecipeItem,
  updateRecipeItem,
  deleteRecipeItem,
  computeCost,
  standardize
} from "../api/products";

import { getMaterials } from "../api/materials";

import "../styles/pages/RecipePage.css";

const RecipePage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [recipeItems, setRecipeItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [costResult, setCostResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editLine, setEditLine] = useState(null);

  const [formData, setFormData] = useState({
    material_id: "",
    recipe_qty: ""
  });

  // Load materials
  const loadMaterials = async () => {
    try {
      const res = await getMaterials();
      setMaterials(res.data.items || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load materials");
    }
  };

  // Load recipe items and map material names
  const loadRecipe = async () => {
    setLoading(true);
    try {
      const res = await getRecipe(productId);
      const items = res.data.items || [];

      const itemsWithNames = items.map((item) => {
        const material = materials.find((m) => m.id === item.material_id);
        return {
          ...item,
          material_name: material ? material.name : `#${item.material_id}`
        };
      });

      setRecipeItems(itemsWithNames);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load recipe items");
    }
    setLoading(false);
  };

  // Initialize
  useEffect(() => {
    async function init() {
      await loadMaterials(); // load materials first
      await loadRecipe(); // then load recipe items
    }
    init();
  }, [productId]);

  useEffect(() => {
  if (materials.length > 0) {
    loadRecipe();
  }
}, [materials]);


  // Handle Add/Edit ingredient
  const handleSave = async () => {
    if (!formData.material_id || !formData.recipe_qty) {
      toast.error("Please select a material and enter quantity");
      return;
    }

    try {
      const body = {
        material_id: formData.material_id,
        recipe_qty: parseFloat(formData.recipe_qty)
      };

      if (editLine) {
        await updateRecipeItem(editLine.id, body);
        toast.success("Ingredient updated");
      } else {
        await addRecipeItem(productId, body);
        toast.success("Ingredient added");
      }

      setModalOpen(false);
      loadRecipe();
    } catch (err) {
      console.log(err);
      toast.error("Failed to save ingredient");
    }
  };

  // Handle delete
  const handleDelete = async (row) => {
    if (!window.confirm("Remove this ingredient?")) return;

    try {
      await deleteRecipeItem(row.id);
      toast.success("Ingredient removed");
      loadRecipe();
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete ingredient");
    }
  };

  // Compute cost
  const handleComputeCost = async () => {
    try {
      const res = await computeCost(productId);
      setCostResult(res.data.cost);
      toast.success("Cost computed");
    } catch (err) {
      toast.error("Failed to compute cost");
    }
  };

  // Standardize cost
  const handleStandardize = async () => {
    try {
      await standardize(productId);
      toast.success("Standard cost saved");
    } catch (err) {
      toast.error("Failed to save standard cost");
    }
  };

  // Table columns
  const columns = [
    { key: "material_name", label: "Material" },
    { key: "recipe_qty", label: "Qty/Batch" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="actions-cell">
          <button
            className="btn-light"
            onClick={() => {
              setEditLine(row);
              setFormData({
                material_id: row.material_id,
                recipe_qty: row.recipe_qty
              });
              setModalOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="btn-danger"
            onClick={() => handleDelete(row)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />

      <main className="content-area">
        <div className="page-header">
          <div className="breadcrumb">
            <span onClick={() => navigate("/products")}>Products</span> / Recipe
          </div>
          <h2 className="page-title">Recipe Setup</h2>

          <button
            className="btn-primary"
            onClick={() => {
              setEditLine(null);
              setFormData({ material_id: "", recipe_qty: "" });
              setModalOpen(true);
            }}
          >
            + Add Ingredient
          </button>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <Table
              columns={columns}
              data={recipeItems.map((item) => ({ ...item, actions: item }))}
            />
          )}
        </div>

        <div className="costing-panel">
          <button className="btn-secondary" onClick={handleComputeCost}>
            Compute Cost
          </button>

          {costResult && (
            <div className="cost-results">
              <h3>Cost Breakdown</h3>
              <div className="cost-line">
                <span>Recipe Cost:</span>
                <span>₦{costResult.recipe_cost}</span>
              </div>
              <div className="cost-line">
                <span>Packaging:</span>
                <span>₦{costResult.packaging_cost}</span>
              </div>
              <div className="cost-line">
                <span>Labour:</span>
                <span>₦{costResult.labour_cost}</span>
              </div>
              <div className="cost-line">
                <span>OPEX:</span>
                <span>₦{costResult.opex_cost}</span>
              </div>
              <div className="cost-total">
                <span>COGS:</span>
                <span>₦{costResult.COGS}</span>
              </div>

              <button className="btn-primary full-width" onClick={handleStandardize}>
                Save Standard Cost
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Add/Edit Ingredient */}
      <Modals
        open={modalOpen}
        title={editLine ? "Edit Ingredient" : "Add Ingredient"}
        onClose={() => setModalOpen(false)}
      >
        <div className="modal-form">
          <label>Material</label>
          <select
            value={formData.material_id}
            onChange={(e) =>
              setFormData({ ...formData, material_id: e.target.value })
            }
          >
            <option value="">-- Select Material --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <label>Qty Per Batch</label>
          <input
            type="number"
            value={formData.recipe_qty}
            onChange={(e) =>
              setFormData({ ...formData, recipe_qty: e.target.value })
            }
          />

          <button className="btn-primary full-width" onClick={handleSave}>
            {editLine ? "Update" : "Save"}
          </button>
        </div>
      </Modals>
    </div>
  );
};

export default RecipePage;
