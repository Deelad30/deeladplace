import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Table from "../components/common/Table";
import Modals from "../components/common/Modals";

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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
  const icon = {
    fontSize: "20px",
    color: "#D91F22",
    marginBottom: "18px",
  };

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
  const [packagingLoading, setPackagingLoading] = useState(true);

  // --- Cost
  const [costResult, setCostResult] = useState(null);
  const [computingCost, setComputingCost] = useState(false);
  const [standardizingCost, setStandardizingCost] = useState(false);

  // --- Batch & Margin
  const [batchSize, setBatchSize] = useState(1);
  const [marginPercent, setMarginPercent] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

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
    setPackagingLoading(true);
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
    setPackagingLoading(false);
  };

  // ----------------- Load Batch & Margin -----------------
  const loadProductSettings = async () => {
    setSettingsLoading(true);
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
    setSettingsLoading(false);
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
    const loadingToast = toast.loading(editLine ? "Updating ingredient..." : "Adding ingredient...");
    try {
      const body = { material_id: formData.material_id, recipe_qty: Number(formData.recipe_qty) };
      if (editLine) {
        await updateRecipeItem(editLine.id, body);
        toast.success("Ingredient updated successfully", { id: loadingToast });
      } else {
        await addRecipeItem(productId, body);
        toast.success("Ingredient added successfully", { id: loadingToast });
      }
      setModalOpen(false);
      loadRecipe();
    } catch {
      toast.error("Failed to save ingredient", { id: loadingToast });
    }
  };

  // ----------------- Handle Delete Ingredient -----------------
  const handleDelete = async row => {
    if (!window.confirm("Remove this ingredient?")) return;
    const loadingToast = toast.loading("Removing ingredient...");
    try {
      await deleteRecipeItem(row.id);
      toast.success("Ingredient removed successfully", { id: loadingToast });
      loadRecipe();
    } catch {
      toast.error("Failed to delete ingredient", { id: loadingToast });
    }
  };

  // ----------------- Handle Save Packaging -----------------
  const handleSavePackaging = async () => {
    if (!packForm.packaging_id || !packForm.qty) return toast.error("Select packaging & enter qty");
    const loadingToast = toast.loading(editingPackaging ? "Updating packaging..." : "Adding packaging...");
    try {
      const body = { product_id: productId, packaging_id: packForm.packaging_id, qty: Number(packForm.qty) };
      if (editingPackaging) {
        await updateProductPackaging(editingPackaging.id, body);
        toast.success("Packaging updated successfully", { id: loadingToast });
      } else {
        await addPackagingToProduct(body);
        toast.success("Packaging added successfully", { id: loadingToast });
      }
      setPackagingModal(false);
      loadProductPackaging();
    } catch {
      toast.error("Failed to save packaging", { id: loadingToast });
    }
  };

  // ----------------- Handle Delete Packaging -----------------
  const handleDeletePackaging = async row => {
    if (!window.confirm("Remove this packaging item?")) return;
    const loadingToast = toast.loading("Removing packaging...");
    try {
      await deleteProductPackaging(row.id);
      toast.success("Packaging removed successfully", { id: loadingToast });
      loadProductPackaging();
    } catch {
      toast.error("Delete failed", { id: loadingToast });
    }
  };

  // ----------------- Handle Compute Cost -----------------
  const handleComputeCost = async () => {
    if (!batchSize || batchSize <= 0) return toast.error("Enter a valid batch size before computing");
    setComputingCost(true);
    const loadingToast = toast.loading("Computing cost breakdown...");
    try {
      const res = await computeCost(productId, { batchQty: batchSize, marginPercent });
      setCostResult(res.data.cost);
      toast.success("Cost computed successfully!", { id: loadingToast });
    } catch {
      toast.error("Failed to compute cost", { id: loadingToast });
    }
    setComputingCost(false);
  };

  const handleSaveStandardCost = async () => {
    if (!costResult) return toast.error("Compute cost first before saving standard cost");
    setStandardizingCost(true);
    const loadingToast = toast.loading("Standardizing cost...");
    try {
      await standardize(productId, { marginPercent });
      toast.success("Standard cost saved successfully!", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save standard cost", { id: loadingToast });
    }
    setStandardizingCost(false);
  };

  // ----------------- Handle Save Batch & Margin -----------------
  const handleSaveBatchMargin = async () => {
    if (!batchSize || batchSize <= 0) return toast.error("Batch size must be greater than 0");
    if (marginPercent < 0 || marginPercent > 1) return toast.error("Margin must be between 0 and 1 (0.x)");
    setSavingSettings(true);
    const loadingToast = toast.loading("Saving settings...");
    try {
      await saveProductSettings(productId, { batch_qty: batchSize, margin_percent: marginPercent });
      toast.success("Batch size & margin saved successfully", { id: loadingToast });
    } catch(err) {
      console.error(err);
      toast.error("Failed to save batch size & margin", { id: loadingToast });
    }
    setSavingSettings(false);
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

  // ----------------- Skeleton Components -----------------
  const TablesSkeleton = () => (
    <div className="skeleton-table">
      <div className="skeleton-table-row skeleton-table-header">
        <div style={{height: "34px", marginBottom: "12px"}} className="skeleton-cell"></div>
      </div>
      {[1, 2, ].map(i => (
        <div key={i} className="skeleton-table-row">
          <div style={{height: "34px", marginBottom: "12px"}} className="skeleton-cell"></div>
        </div>
      ))}
    </div>
  );

  const TableSkeleton = () => (
    <div className="skeleton-table">
      <div className="skeleton-table-row skeleton-table-header">
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
        </div>
      ))}
    </div>
  );

  // ----------------- Render -----------------
  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />
      <main className="content-area">

        {/* Page Header */}
        <div className="page-header">
          <div style={{display:"flex", justifyContent: "center", cursor: "pointer"}} className="breadcrumb" onClick={() => navigate("/products")}>
            <FontAwesomeIcon icon={faArrowLeft} style={icon} />
            <span style={{display:"inline-block", fontSize:"15px"}}>Products</span>
          </div>
          <h2 className="page-title">Recipe Setup</h2>
          <div></div>
        </div>

        {/* Batch Size & Margin */}
        {settingsLoading ? (
          <TablesSkeleton />
        ) : (
          <div className="card">
            <h3>Batch & Margin</h3>
            <div className="form-group">
              <label>Batch Size</label>
              <input 
                type="number" 
                value={batchSize} 
                onChange={e => setBatchSize(Number(e.target.value))} 
                min="1"
                disabled={savingSettings}
              />
            </div>
            <div className="form-group">
              <label>Margin % (0.x)</label>
              <input 
                type="number" 
                value={marginPercent} 
                onChange={e => setMarginPercent(Number(e.target.value))} 
                step="0.01" 
                min="0" 
                max="1" 
                placeholder="Enter 0.2 for 20%"
                disabled={savingSettings}
              />
            </div>
            <button 
              style={{backgroundColor:"rgb(217, 31, 34)"}} 
              className="btn-primary" 
              onClick={handleSaveBatchMargin}
              disabled={savingSettings}
            >
              {savingSettings ? (
                <>
                  Saving...
                </>
              ) : "Save Batch & Margin"}
            </button>
          </div>
        )}

        {/* Ingredients Table */}
        <div className="card">
          <div className="section-header">
            <h3>Ingredients</h3>
            <button 
              style={{ backgroundColor:"rgb(217, 31, 34)" }} 
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
          {loading ? <TableSkeleton /> : <Table columns={ingredientColumns} data={recipeItems} />}
        </div>

        {/* Packaging Table */}
        <div className="card">
          <div className="section-header">
            <h3>Packaging</h3>
            <button 
              style={{ backgroundColor:"rgb(217, 31, 34)" }} 
              className="btn-primary" 
              onClick={() => { 
                setEditingPackaging(null); 
                setPackForm({ packaging_id: "", qty: "" }); 
                setPackagingModal(true); 
              }}
            >
              + Add Packaging
            </button>
          </div>
          {packagingLoading ? <TableSkeleton /> : <Table columns={packagingColumns} data={productPackaging} />}
        </div>

        {/* Cost Panel with Charts */}
        <div className="costing-panel">
          <button 
            style={{ backgroundColor:"rgb(217, 31, 34)" }} 
            className="btn-primary" 
            onClick={handleComputeCost}
            disabled={computingCost}
          >
            {computingCost ? (
              <>
                Computing...
              </>
            ) : "Compute Cost"}
          </button>

          {computingCost && !costResult && (
            <div className="cost-results">
              <div className="skeleton-title"></div>
              <div className="skeleton-chart"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-chart"></div>
              <div className="skeleton-cost-lines">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(i => (
                  <div key={i} className="skeleton-cost-line"></div>
                ))}
              </div>
            </div>
          )}

          {costResult && !computingCost && (
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
                    label={(entry) => `₦${round(entry.value, 2).toFixed(2)}`}
                    isAnimationActive={true}
                  >
                    {perUnitCostData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(value) => `₦${Number(value).toFixed(2)}`} />
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
                  <ReTooltip formatter={(value) => `₦${round(value.toFixed(2))}`} />
                  <ReLegend />
                  <Bar dataKey="value" fill="#82ca9d" isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>

              {/* Textual list of costs */}
         <div className="cost-card">
  <h3 className="cost-title">Cost Breakdown</h3>

  <div className="cost-table-wrapper">
    <table className="cost-table">
      <thead>
        <tr>
          <th>Cost Item</th>
          <th>Per Unit (₦)</th>
          <th>Per Batch (₦)</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>Recipe Cost</td>
          <td>{round(costResult.recipe_cost)}</td>
          <td>{round(costResult.recipe_cost * batchSize)}</td>
        </tr>

        <tr>
          <td>Packaging</td>
          <td>{round(costResult.packaging_cost)}</td>
          <td>{round(costResult.packaging_cost * batchSize)}</td>
        </tr>

        <tr>
          <td>Labour</td>
          <td>{round(costResult.labour_cost)}</td>
          <td>{round(costResult.labour_cost * batchSize)}</td>
        </tr>

        <tr>
          <td>OPEX</td>
          <td>{round(costResult.opex_cost)}</td>
          <td>{round(costResult.opex_cost * batchSize)}</td>
        </tr>

        <tr className="highlight">
          <td>COGS</td>
          <td>{round(costResult.COGS)}</td>
          <td>{round(costResult.COGS * batchSize)}</td>
        </tr>

        <tr className="highlight">
          <td>TCOP</td>
          <td>{round(costResult.TCOP)}</td>
          <td>{round(costResult.TCOP * batchSize)}</td>
        </tr>

        <tr className="selling">
          <td>Selling Price</td>
          <td>{round(costResult.selling_price || 0)}</td>
          <td>—</td>
        </tr>

        <tr className="margin">
          <td>Margin</td>
          <td colSpan="2">
            {(costResult.margin_percent
              ? (costResult.margin_percent * 100).toFixed(2)
              : "0")}%
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

              <button 
                style={{ backgroundColor:"rgb(217, 31, 34)" }} 
                className="btn-primary full-width" 
                onClick={handleSaveStandardCost}
                disabled={standardizingCost}
              >
                {standardizingCost ? (
                  <>
                    Standardizing...
                  </>
                ) : "Save Standard Cost"}
              </button>
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