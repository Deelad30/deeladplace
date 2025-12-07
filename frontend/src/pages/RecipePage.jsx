import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Table from "../components/common/Table";
import Modals from "../components/common/Modals";

import {
  getRecipe, addRecipeItem, updateRecipeItem, deleteRecipeItem,
  computeCost, standardize
} from "../api/products";

import { getMaterials } from "../api/materials";
import { getPackaging } from "../api/packaging.services";
import {
  getProductPackaging, addPackagingToProduct, updateProductPackaging, deleteProductPackaging
} from "../api/packagingMap.services";

import { getProductSettings, saveProductSettings } from "../api/products";

import "../styles/pages/RecipePage.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FF6666"];

const RecipePage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  // --- Recipe / Ingredients
  const [recipeItems, setRecipeItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLine, setEditLine] = useState(null);
  const [formData, setFormData] = useState({ material_id: "", recipe_qty: "" });
  const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;

  // --- Packaging
  const [packagingList, setPackagingList] = useState([]);
  const [productPackaging, setProductPackaging] = useState([]);
  const [packagingModal, setPackagingModal] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState(null);
  const [packForm, setPackForm] = useState({ packaging_id: "", qty: "" });

  // --- Cost
  const [costResult, setCostResult] = useState(null);

  // --- Batch & Margin
  const [batchSize, setBatchSize] = useState(1);
  const [marginPercent, setMarginPercent] = useState(0);

  // ----------------- Load Materials -----------------
  const loadMaterials = async () => {
    try {
      const res = await getMaterials();
      setMaterials(res.data.items || []);
    } catch {
      toast.error("Failed to load materials");
    }
  };

  // ----------------- Load Packaging -----------------
  const loadPackagingList = async () => {
    try {
      const res = await getPackaging();
      setPackagingList(res.data.packaging || []);
    } catch {
      toast.error("Failed to load packaging list");
    }
  };

  // ----------------- Load Recipe -----------------
  const loadRecipe = async () => {
    setLoading(true);
    try {
      const res = await getRecipe(productId);
      const items = res.data.items || [];
      const mapped = items.map(item => {
        const material = materials.find(m => m.id === item.material_id);
        return {
          ...item,
          material_name: material ? material.name : `#${item.material_id}`,
          recipe_qty: Number(item.recipe_qty)
        };
      });
      setRecipeItems(mapped);
    } catch {
      toast.error("Failed to load recipe items");
    }
    setLoading(false);
  };

  // ----------------- Load Product Packaging -----------------
  const loadProductPackaging = async () => {
    try {
      const res = await getProductPackaging(productId);
      const mapped = (res.data.packaging || []).map(p => {
        const pack = packagingList.find(pkg => pkg.id === p.packaging_id);
        return {
          ...p,
          packaging_name: pack ? pack.name : "",
          cost_per_unit: pack ? Number(pack.cost_per_unit) : 0,
          qty: Number(p.qty),
          total_cost: pack ? (Number(pack.cost_per_unit) * Number(p.qty)).toFixed(2) : "0.00"
        };
      });
      setProductPackaging(mapped);
    } catch {
      toast.error("Failed to load product packaging");
    }
  };

  // ----------------- Load Batch & Margin -----------------
  const loadProductSettings = async () => {
    try {
      const res = await getProductSettings(productId);
      if (res.data.settings) {
        setBatchSize(res.data.settings.batch_qty || 1);
        setMarginPercent(res.data.settings.margin_percent || 0);
      }
    } catch(err) {
      console.error(err);
      toast.error("Failed to load product settings");
    }
  };

  // ----------------- Initial Load -----------------
  useEffect(() => {
    async function init() {
      await loadMaterials();
      await loadPackagingList();
      await loadProductSettings();
    }
    init();
    // eslint-disable-next-line
  }, [productId]);

  // Load recipe & packaging after supporting arrays exist
  useEffect(() => { if (materials.length) loadRecipe(); },
  // eslint-disable-next-line
  [materials]);
  useEffect(() => { if (packagingList.length) loadProductPackaging(); },
  // eslint-disable-next-line
  [packagingList]);

  // ----------------- Handle Save Ingredient -----------------
  const handleSave = async () => {
    if (!formData.material_id || !formData.recipe_qty) return toast.error("Select material & enter qty");
    try {
      const body = { material_id: formData.material_id, recipe_qty: Number(formData.recipe_qty) };
      if (editLine) {
        await updateRecipeItem(editLine.id, body);
        toast.success("Ingredient updated");
      } else {
        await addRecipeItem(productId, body);
        toast.success("Ingredient added");
      }
      setModalOpen(false);
      loadRecipe();
    } catch {
      toast.error("Failed to save ingredient");
    }
  };

  // ----------------- Handle Delete Ingredient -----------------
  const handleDelete = async row => {
    if (!window.confirm("Remove this ingredient?")) return;
    try {
      await deleteRecipeItem(row.id);
      toast.success("Ingredient removed");
      loadRecipe();
    } catch {
      toast.error("Failed to delete ingredient");
    }
  };

  // ----------------- Handle Save Packaging -----------------
  const handleSavePackaging = async () => {
    if (!packForm.packaging_id || !packForm.qty) return toast.error("Select packaging & enter qty");
    try {
      const body = { product_id: productId, packaging_id: packForm.packaging_id, qty: Number(packForm.qty) };
      if (editingPackaging) {
        await updateProductPackaging(editingPackaging.id, body);
        toast.success("Packaging updated");
      } else {
        await addPackagingToProduct(body);
        toast.success("Packaging added");
      }
      setPackagingModal(false);
      loadProductPackaging();
    } catch {
      toast.error("Failed to save packaging");
    }
  };

  // ----------------- Handle Delete Packaging -----------------
  const handleDeletePackaging = async row => {
    if (!window.confirm("Remove this packaging item?")) return;
    try {
      await deleteProductPackaging(row.id);
      toast.success("Packaging removed");
      loadProductPackaging();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ----------------- Handle Compute Cost -----------------
  const handleComputeCost = async () => {
    if (!batchSize || batchSize <= 0) return toast.error("Enter a valid batch size before computing");
    try {
      const res = await computeCost(productId, { batchQty: batchSize, marginPercent });
      setCostResult(res.data.cost);
      toast.success("Cost computed");
    } catch {
      toast.error("Failed to compute cost");
    }
  };

  const handleSaveStandardCost = async () => {
    if (!costResult) return toast.error("Compute cost first before saving standard cost");
    try {
      console.log(marginPercent);
      
      await standardize(productId, { marginPercent });
      toast.success("Standard cost saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save standard cost");
    }
  };

  // ----------------- Handle Save Batch & Margin -----------------
  const handleSaveBatchMargin = async () => {
    if (!batchSize || batchSize <= 0) return toast.error("Batch size must be greater than 0");
    if (marginPercent < 0 || marginPercent > 1) return toast.error("Margin must be between 0 and 1 (0.x)");
    try {
      await saveProductSettings(productId, { batch_qty: batchSize, margin_percent: marginPercent });
      toast.success("Batch size & margin saved");
    } catch(err) {
      console.error(err);
      toast.error("Failed to save batch size & margin");
    }
  };

  // ----------------- Table Columns -----------------
  const ingredientColumns = [
    { key: "material_name", label: "Material" },
    { key: "recipe_qty", label: "Qty/Batch" },
    {
      key: "actions",
      label: "Actions",
      render: row => (
        <div className="actions-cell">
          <button className="btn-light" onClick={() => { setEditLine(row); setFormData({ material_id: row.material_id, recipe_qty: row.recipe_qty }); setModalOpen(true); }}>Edit</button>
          <button className="btn-danger" onClick={() => handleDelete(row)}>Delete</button>
        </div>
      )
    }
  ];

  const packagingColumns = [
    { key: "packaging_name", label: "Packaging" },
    { key: "qty", label: "Qty" },
    { key: "cost_per_unit", label: "Cost/Unit" },
    { key: "total_cost", label: "Total" },
    {
      key: "actions",
      label: "Actions",
      render: row => (
        <div className="actions-cell">
          <button className="btn-light" onClick={() => { setEditingPackaging(row); setPackForm({ packaging_id: row.packaging_id, qty: row.qty }); setPackagingModal(true); }}>Edit</button>
          <button className="btn-danger" onClick={() => handleDeletePackaging(row)}>Delete</button>
        </div>
      )
    }
  ];

  // ----------------- Prepare Chart Data -----------------
  const perUnitCostData = costResult ? [
    { name: "Recipe", value: costResult.recipe_cost },
    { name: "Packaging", value: costResult.packaging_cost },
    { name: "Labour", value: costResult.labour_cost },
    { name: "OPEX", value: costResult.opex_cost },
    { name: "COGS", value: costResult.COGS },
  ] : [];

  const perBatchCostData = costResult ? [
    { name: "Recipe", value: costResult.recipe_cost * batchSize },
    { name: "Packaging", value: costResult.packaging_cost * batchSize },
    { name: "Labour", value: costResult.labour_cost * batchSize },
    { name: "OPEX", value: costResult.opex_cost * batchSize },
    { name: "COGS", value: costResult.COGS * batchSize },
  ] : [];

  // ----------------- Render -----------------
  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />
      <main className="content-area">

        {/* Page Header */}
        <div className="page-header">
          <div className="breadcrumb" onClick={() => navigate("/products")}>Products</div>
          <h2 className="page-title">Recipe Setup</h2>
          <button className="btn-primary" onClick={() => { setEditLine(null); setFormData({ material_id: "", recipe_qty: "" }); setModalOpen(true); }}>+ Add Ingredient</button>
        </div>

        {/* Batch Size & Margin */}
        <div className="card">
          <h3>Batch & Margin</h3>
          <div className="form-group">
            <label>Batch Size</label>
            <input type="number" value={batchSize} onChange={e => setBatchSize(Number(e.target.value))} min="1" />
          </div>
          <div className="form-group">
            <label>Margin % (0.x)</label>
            <input type="number" value={marginPercent} onChange={e => setMarginPercent(Number(e.target.value))} step="0.01" min="0" max="1" placeholder="Enter 0.2 for 20%" />
          </div>
          <button className="btn-primary" onClick={handleSaveBatchMargin}>Save Batch & Margin</button>
        </div>

        {/* Ingredients Table */}
        <div className="card">
          {loading ? <div className="loading">Loading...</div> : <Table columns={ingredientColumns} data={recipeItems} />}
        </div>

        {/* Packaging Table */}
        <div className="card">
          <div className="section-header">
            <h3>Packaging</h3>
            <button className="btn-primary" onClick={() => { setEditingPackaging(null); setPackForm({ packaging_id: "", qty: "" }); setPackagingModal(true); }}>+ Add Packaging</button>
          </div>
          <Table columns={packagingColumns} data={productPackaging} />
        </div>

        {/* Cost Panel with Charts */}

          {/* Cost Panel with Charts and List */}
<div className="costing-panel">
  <button className="btn-primary" onClick={handleComputeCost}>Compute Cost</button>

  {costResult && (
    <div className="cost-results">
      <h3>Cost Breakdown (Per Unit)</h3>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={perUnitCostData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
            isAnimationActive={true}
          >
            {perUnitCostData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ReTooltip formatter={(value) => `₦${value.toFixed(2)}`} />
          <ReLegend />
        </PieChart>
      </ResponsiveContainer>

      {/* Bar Chart for Per Batch */}
      <h3>Cost Breakdown (Per Batch)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={perBatchCostData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ReTooltip formatter={(value) => `₦${value.toFixed(2)}`} />
          <ReLegend />
          <Bar dataKey="value" fill="#82ca9d" isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>

      {/* Textual list of costs */}
      <div className="cost-lines">
        <div className="cost-line">{`Recipe Cost (per unit): ₦${round(costResult.recipe_cost)}`}</div>
        <div className="cost-line">{`Recipe Cost (per batch): ₦${round(costResult.recipe_cost * batchSize)}`}</div>
        <div className="cost-line">{`Packaging (per unit): ₦${round(costResult.packaging_cost)}`}</div>
        <div className="cost-line">{`Packaging (per batch): ₦${round(costResult.packaging_cost * batchSize)}`}</div>
        <div className="cost-line">{`Labour (per unit): ₦${round(costResult.labour_cost)}`}</div>
        <div className="cost-line">{`Labour (per batch): ₦${round(costResult.labour_cost * batchSize)}`}</div>
        <div className="cost-line">{`OPEX (per unit): ₦${round(costResult.opex_cost)}`}</div>
        <div className="cost-line">{`OPEX (per batch): ₦${round(costResult.opex_cost * batchSize)}`}</div>
        <div className="cost-line">{`COGS (per unit): ₦${round(costResult.COGS)}`}</div>
        <div className="cost-line">{`COGS (per batch): ₦${round(costResult.COGS * batchSize)}`}</div>
        <div className="cost-line">{`TCOP (per unit): ₦${round(costResult.TCOP)}`}</div>
        <div className="cost-line">{`TCOP (per batch): ₦${round(costResult.TCOP * batchSize)}`}</div>
        <div className="cost-line">{`Selling Price (per unit): ₦${round(costResult.selling_price || 0)}`}</div>
        <div className="cost-line">{`Margin: ${(costResult.margin_percent ? (costResult.margin_percent * 100).toFixed(2) : "0")}%`}</div>
      </div>

      <button className="btn-primary full-width" onClick={handleSaveStandardCost}>Save Standard Cost</button>
    </div>
  )}
</div>


        {/* Ingredient Modal */}
        <Modals open={modalOpen} title={editLine ? "Edit Ingredient" : "Add Ingredient"} onClose={() => setModalOpen(false)}>
          <div className="modal-form">
            <label>Material</label>
            <select value={formData.material_id} onChange={e => setFormData({ ...formData, material_id: e.target.value })}>
              <option value="">-- Select Material --</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <label>Qty Per Batch</label>
            <input type="number" value={formData.recipe_qty} onChange={e => setFormData({ ...formData, recipe_qty: e.target.value })} />
            <button className="btn-primary full-width" onClick={handleSave}>{editLine ? "Update" : "Save"}</button>
          </div>
        </Modals>

        {/* Packaging Modal */}
        <Modals open={packagingModal} title={editingPackaging ? "Edit Packaging" : "Add Packaging"} onClose={() => setPackagingModal(false)}>
          <div className="modal-form">
            <label>Packaging</label>
            <select value={packForm.packaging_id} onChange={e => setPackForm({ ...packForm, packaging_id: e.target.value })}>
              <option value="">-- Select Packaging --</option>
              {packagingList.map(p => <option key={p.id} value={p.id}>{p.name} (₦{p.cost_per_unit})</option>)}
            </select>
            <label>Quantity</label>
            <input type="number" value={packForm.qty} onChange={e => setPackForm({ ...packForm, qty: e.target.value })} />
            <button className="btn-primary full-width" onClick={handleSavePackaging}>{editingPackaging ? "Update" : "Save"}</button>
          </div>
        </Modals>

      </main>
    </div>
  );
};

export default RecipePage;
