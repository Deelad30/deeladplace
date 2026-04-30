import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

import Layout from "../components/common/Layout";
import Modal from "../components/common/Modal"; // Standard Modal
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

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
import { getLabour } from "../api/labour";
import { getOpex } from "../api/opex";
import { 
  getProductLabour, addLabourToProduct, updateProductLabour, deleteProductLabour 
} from "../api/productLabour.services";
import { 
  getProductOpex, addOpexToProduct, updateProductOpex, deleteProductOpex 
} from "../api/productOpex.services";

import "../styles/shared/PremiumShared.css"; // Shared Premium Styles
import "../styles/pages/RecipePage.css"; // Keep specific chart styles if any, but override basics

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
  const round = (num, nearest = 1) => Math.round(num / nearest) * nearest;

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

  // --- Batch & Margin & Selling Price
  const [batchSize, setBatchSize] = useState(1);
  const [marginPercent, setMarginPercent] = useState(0);
  const [sellingPrice, setSellingPrice] = useState("");
  const [tcop, setTcop] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // --- Product Labour
  const [labourList, setLabourList] = useState([]);
  const [productLabour, setProductLabour] = useState([]);
  const [labourModal, setLabourModal] = useState(false);
  const [editingLabour, setEditingLabour] = useState(null);
  const [labourForm, setLabourForm] = useState({ labour_id: "", amount: "" });
  const [labourLoading, setLabourLoading] = useState(true);

  // --- Product Opex
  const [opexList, setOpexList] = useState([]);
  const [productOpex, setProductOpex] = useState([]);
  const [opexModal, setOpexModal] = useState(false);
  const [editingOpex, setEditingOpex] = useState(null);
  const [opexForm, setOpexForm] = useState({ opex_id: "", amount: "" });
  const [opexLoading, setOpexLoading] = useState(true);
  
  // Track action loading state for modals
  const [actionLoading, setActionLoading] = useState(false);

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

  const loadLabourList = async () => {
    try {
      const res = await getLabour();
      setLabourList(res.data.labour || []);
    } catch {
      toast.error("Failed to load labour list");
    }
  };

  const loadOpexList = async () => {
    try {
      const res = await getOpex();
      setOpexList(res.data.opex || []);
    } catch {
      toast.error("Failed to load opex list");
    }
  };

  // ----------------- Load Recipe -----------------
  const loadRecipe = async () => {
    setLoading(true);
    try {
      const res = await getRecipe(productId);
      const items = res.data.items || [];

      const mapped = items.map(item => {
        // Use loose equality (==) to handle String vs Number mismatch
        const material = materials.find(m => m.id == item.material_id);
        
        return {
          ...item,
          // Priority: 1. Name from API (already joined) 2. Name from lookup 3. Fallback ID
          material_name: item.material_name || (material ? material.name : `#${item.material_id}`),
          recipe_qty: Number(item.recipe_qty),
          unit_cost: Number(item.unit_cost || 0)
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
        // Preference: 1. Name from API join, 2. Name from local lookup, 3. "Unknown Packaging"
        const pack = packagingList.find(pkg => pkg.id == p.packaging_id);
        const name = p.packaging_name || (pack ? pack.name : "Unknown Packaging");
        const cost = p.cost_per_unit !== undefined ? Number(p.cost_per_unit) : (pack ? Number(pack.cost_per_unit) : 0);
        
        return {
          ...p,
          packaging_name: name,
          cost_per_unit: cost,
          qty: Number(p.qty),
          total_cost: (cost * Number(p.qty)).toFixed(2)
        };
      });
      setProductPackaging(mapped);
    } catch {
      toast.error("Failed to load product packaging");
    }
    setPackagingLoading(false);
  };

  const loadProductLabour = async () => {
    setLabourLoading(true);
    try {
      const res = await getProductLabour(productId);
      setProductLabour(res.data.labour || []);
    } catch {
      toast.error("Failed to load product labour");
    }
    setLabourLoading(false);
  };

  const loadProductOpex = async () => {
    setOpexLoading(true);
    try {
      const res = await getProductOpex(productId);
      setProductOpex(res.data.opex || []);
    } catch {
      toast.error("Failed to load product opex");
    }
    setOpexLoading(false);
  };

  // ----------------- Load Batch, Margin & Price -----------------
  const loadProductSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await getProductSettings(productId);
      if (res.data.settings) {
        setBatchSize(res.data.settings.batch_qty || 1);
        setMarginPercent(res.data.settings.margin_percent || 0);
        setSellingPrice(res.data.settings.selling_price || "");
        setTcop(res.data.settings.tcop || 0);
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
      await loadLabourList();
      await loadOpexList();
      await loadProductSettings();
      // Note: Recipe and Packaging will be loaded by the specific useEffects below once materials/packaging lists arrive
      await loadProductLabour();
      await loadProductOpex();
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
    setActionLoading(true); 
    try {
      const body = { material_id: formData.material_id, recipe_qty: Number(formData.recipe_qty) };
      if (editLine) {
        await updateRecipeItem(editLine.id, body);
        toast.success("Ingredient updated");
        setModalOpen(false);
      } else {
        await addRecipeItem(productId, body);
        toast.success("Ingredient added. Add another?");
        setFormData({ material_id: "", recipe_qty: "" }); // Reset & Keep Open
      }
      loadRecipe();
    } catch {
      toast.error("Failed to save ingredient");
    } finally {
        setActionLoading(false);
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
    setActionLoading(true);
    try {
      const body = { product_id: productId, packaging_id: packForm.packaging_id, qty: Number(packForm.qty) };
      if (editingPackaging) {
        await updateProductPackaging(editingPackaging.id, body);
        toast.success("Packaging updated");
        setPackagingModal(false);
      } else {
        await addPackagingToProduct(body);
        toast.success("Packaging added. Add another?");
        setPackForm({ packaging_id: "", qty: "" }); // Reset & Keep Open
      }
      loadProductPackaging();
    } catch {
      toast.error("Failed to save packaging");
    } finally {
        setActionLoading(false);
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

  // ----------------- Handle Product Labour -----------------
  const handleSaveLabour = async (e) => {
    e?.preventDefault();
    if (!labourForm.labour_id || !labourForm.amount) return toast.error("Select labour & enter amount");
    setActionLoading(true);
    try {
      const body = { product_id: productId, labour_id: labourForm.labour_id, amount: Number(labourForm.amount) };
      if (editingLabour) {
        await updateProductLabour(editingLabour.id, body);
        toast.success("Labour updated");
        setLabourModal(false);
      } else {
        await addLabourToProduct(body);
        toast.success("Labour added. Add another?");
        setLabourForm({ labour_id: "", amount: "" }); // Reset & Keep Open
      }
      loadProductLabour();
    } catch {
      toast.error("Failed to save labour mapping");
    } finally {
        setActionLoading(false);
    }
  };

  const handleDeleteLabour = async row => {
    if (!window.confirm("Remove this labour association?")) return;
    try {
      await deleteProductLabour(row.id);
      toast.success("Labour removed");
      loadProductLabour();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ----------------- Handle Product Opex -----------------
  const handleSaveOpex = async (e) => {
    e?.preventDefault();
    if (!opexForm.opex_id || !opexForm.amount) return toast.error("Select opex & enter amount");
    setActionLoading(true);
    try {
      const body = { product_id: productId, opex_id: opexForm.opex_id, amount: Number(opexForm.amount) };
      if (editingOpex) {
        await updateProductOpex(editingOpex.id, body);
        toast.success("Opex updated");
        setOpexModal(false);
      } else {
        await addOpexToProduct(body);
        toast.success("Opex added. Add another?");
        setOpexForm({ opex_id: "", amount: "" }); // Reset & Keep Open
      }
      loadProductOpex();
    } catch {
      toast.error("Failed to save opex mapping");
    } finally {
        setActionLoading(false);
    }
  };

  const handleDeleteOpex = async row => {
    if (!window.confirm("Remove this opex association?")) return;
    try {
      await deleteProductOpex(row.id);
      toast.success("Opex removed");
      loadProductOpex();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ----------------- Handlers for Margin & Selling Price --------------
  const handleMarginChange = (val) => {
    if (val === "") {
      setMarginPercent("");
      return;
    }
    const margin = Number(val);
    setMarginPercent(margin);
    if (tcop > 0 && margin < 1 && margin >= 0) {
      setSellingPrice(Math.round(tcop / (1 - margin)));
    }
  };

  const handleSellingPriceChange = (val) => {
    if (val === "") {
      setSellingPrice("");
      return;
    }
    const price = Number(val);
    setSellingPrice(price);
    if (tcop > 0 && price > 0) {
      setMarginPercent(Number(((price - tcop) / price).toFixed(4)));
    }
  };

  // ----------------- Handle Compute Cost -----------------
  const handleComputeCost = async () => {
    if (!batchSize || batchSize <= 0) return toast.error("Enter a valid batch size before computing");
    setComputingCost(true);
    try {
      const res = await computeCost(productId, { batchSize, marginPercent, sellingPrice });
      setCostResult(res.data.cost);
      setTcop(res.data.cost.TCOP);
      toast.success("Cost computed successfully!");
    } catch {
      toast.error("Failed to compute cost");
    }
    setComputingCost(false);
  };

  const handleSaveStandardCost = async () => {
    if (!costResult) return toast.error("Compute cost first before saving standard cost");
    setStandardizingCost(true);
    try {
      await standardize(productId, { marginPercent });
      toast.success("Standard cost saved successfully!");
      navigate("/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save standard cost");
    }
    setStandardizingCost(false);
  };

  // ----------------- Handle Save Configuration -----------------
  const handleSaveBatchMargin = async () => {
    if (!batchSize || batchSize <= 0) return toast.error("Batch size must be greater than 0");
    if (marginPercent < 0 || marginPercent > 1) return toast.error("Margin must be between 0 and 1 (0.x)");
    setSavingSettings(true);
    try {
      await saveProductSettings(productId, { batch_qty: batchSize, margin_percent: marginPercent, selling_price: sellingPrice || 0 });
      toast.success("Configuration saved successfully");
    } catch(err) {
      console.error(err);
      toast.error("Failed to save configuration");
    }
    setSavingSettings(false);
  };

  // ----------------- Chart Data -----------------
  const perUnitCostData = costResult ? [
    { name: "Recipe", value: costResult.recipe_cost },
    { name: "Packaging", value: costResult.packaging_cost },
    { name: "Labour", value: costResult.labour_cost },
    { name: "OPEX", value: costResult.opex_cost },
  ].filter(item => item.value > 0) : [];

  const perBatchCostData = costResult ? [
    { name: "Recipe", value: costResult.recipe_cost * batchSize },
    { name: "Packaging", value: costResult.packaging_cost * batchSize },
    { name: "Labour", value: costResult.labour_cost * batchSize },
    { name: "OPEX", value: costResult.opex_cost * batchSize },
  ].filter(item => item.value > 0) : [];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };


  // ----------------- Render -----------------
  return (
    <Layout>
      <div className="page-container">
        {actionLoading && <div className="loading-overlay"><div className="spinner"></div></div>}

        {/* Page Header */}
        <div className="page-header">
           <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
              <div 
                 onClick={() => navigate("/products")}
                 style={{cursor:'pointer', padding:'8px', background:'#f1f5f9', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center'}}
              >
                 <FontAwesomeIcon icon={faArrowLeft} color="#64748b" />
              </div>
              <h2 style={{marginBottom:"0px"}} className="page-title">Recipe Setup</h2>
           </div>
        </div>

        {/* Batch Size Configuration Card */}
        <div className="premium-card" style={{marginBottom:'24px'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                 <h3 style={{fontSize:'18px', fontWeight:'700', color:'yellow'}}>Batch Configuration</h3>
                 <button 
                    className="premium-btn primary"
                    onClick={handleSaveBatchMargin} 
                    disabled={savingSettings}
                 >
                    {savingSettings ? "Saving..." : "Save Batch"}
                 </button>
             </div>
             <div className="form-grid" style={{marginTop:'20px'}}>
                 <div className="form-group">
                    <label style={{color:'white!important'}} className="premium-label-3">Batch Size</label>
                    <input 
                        className="premium-input"
                        type="number" 
                        value={batchSize} 
                        onChange={e => setBatchSize(Number(e.target.value))} 
                        min="1"
                        disabled={savingSettings}
                    />
                    <small style={{color:'#94a3b8', display:'block', marginTop:'8px'}}>
                        Number of units produced in a single batch. All recipe quantities entered below should be for this batch size.
                    </small>
                 </div>
             </div>
        </div>

        {/* Ingredients Table */}
        <div className="premium-card" style={{marginBottom:'24px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h3 style={{fontSize:'18px', fontWeight:'700', color:'yellow'}}>Ingredients</h3>
                <button 
                    className="premium-btn primary"
                    onClick={() => { setEditLine(null); setFormData({ material_id: "", recipe_qty: "" }); setModalOpen(true); }}
                >+ Add Ingredient</button>
            </div>
            
            <div className="table-container" style={{marginTop:'0', border:'none', boxShadow:'none'}}>
               <div className="premium-table-wrapper">
                  <table className="premium-table">
                     <thead>
                        <tr>
                            <th>Material</th>
                            <th>Qty/Batch</th>
                            <th>Unit</th>
                            <th>Cost/Qty</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {recipeItems.length === 0 ? (
                            <tr><td colSpan="4" className="empty-state">No ingredients added yet.</td></tr>
                        ) : (
                            recipeItems.map(item => (
                                <tr key={item.id}>
                                    <td style={{fontWeight:'600'}}>{item.material_name}</td>
                                    <td>{item.recipe_qty}</td>
                                    <td style={{color:'#64748b', fontSize:'13px'}}>{item.measurement_unit}</td>
                                    <td style={{color: '#10b981', fontWeight: '700'}}>
                                        ₦{(item.unit_cost * item.recipe_qty).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                    <td style={{textAlign:'right'}}>
                                        <div className="actions-cell">
                                            <button className="item-action-btn edit" onClick={() => { setEditLine(item); setFormData({ material_id: item.material_id, recipe_qty: item.recipe_qty }); setModalOpen(true); }}>Edit</button>
                                            <button className="item-action-btn delete" onClick={() => handleDelete(item)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
        </div>

        {/* Packaging Table */}
        <div className="premium-card" style={{marginBottom:'24px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h3 style={{fontSize:'18px', fontWeight:'700', color:'yellow'}}>Packaging</h3>
                <button 
                    className="premium-btn primary"
                    onClick={() => { setEditingPackaging(null); setPackForm({ packaging_id: "", qty: "" }); setPackagingModal(true); }}
                >+ Add Packaging</button>
            </div>
            
            <div className="table-container" style={{marginTop:'0', border:'none', boxShadow:'none'}}>
               <div className="premium-table-wrapper">
                  <table className="premium-table">
                     <thead>
                        <tr>
                            <th>Packaging</th>
                            <th>Qty</th>
                            <th>Cost/Unit</th>
                            <th>Total</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {productPackaging.length === 0 ? (
                            <tr><td colSpan="5" className="empty-state">No packaging added yet.</td></tr>
                        ) : (
                            productPackaging.map(p => (
                                <tr key={p.id}>
                                    <td style={{fontWeight:'600'}}>{p.packaging_name}</td>
                                    <td>{p.qty}</td>
                                    <td>₦{p.cost_per_unit}</td>
                                    <td>₦{p.total_cost}</td>
                                    <td style={{textAlign:'right'}}>
                                        <div className="actions-cell">
                                            <button className="item-action-btn edit" onClick={() => { setEditingPackaging(p); setPackForm({ packaging_id: p.packaging_id, qty: p.qty }); setPackagingModal(true); }}>Edit</button>
                                            <button className="item-action-btn delete" onClick={() => handleDeletePackaging(p)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
        </div>

        {/* Labour & Opex Tables (Grid) */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(500px, 1fr))', gap:'24px', marginBottom:'24px'}}>
             {/* Labour */}
             <div className="premium-card">
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <h3 style={{fontSize:'18px', fontWeight:'700', color:'yellow'}}>Direct Labour</h3>
                    <button 
                        className="premium-btn primary"
                        onClick={() => { setEditingLabour(null); setLabourForm({ labour_id: "", amount: "" }); setLabourModal(true); }}
                    >+ Add</button>
                 </div>
                 <div className="table-container" style={{marginTop:'0', border:'none', boxShadow:'none'}}>
                 <div className="premium-table-wrapper">
                    <table className="premium-table">
                        <thead>
                            <tr>
                            </tr>
                        </thead>
                        <tbody>
                            {productLabour.length === 0 ? (
                                <tr><td colSpan="3" className="empty-state">No labour costs.</td></tr>
                            ) : (
                                productLabour.map(l => (
                                    <tr key={l.id}>
                                        <td style={{fontWeight:'600'}}>{l.labour_name}</td>
                                        <td>₦{Number(l.amount).toLocaleString()}</td>
                                        <td style={{textAlign:'right'}}>
                                            <div className="actions-cell">
                                                <button className="item-action-btn edit" onClick={() => { setEditingLabour(l); setLabourForm({ labour_id: l.labour_id, amount: l.amount }); setLabourModal(true); }}>Edit</button>
                                                <button className="item-action-btn delete" onClick={() => handleDeleteLabour(l)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                 </div>
                 </div>
             </div>

             {/* Opex */}
             <div className="premium-card">
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <h3 style={{fontSize:'18px', fontWeight:'700', color:'yellow'}}>Direct Opex</h3>
                    <button 
                        className="premium-btn primary"
                        onClick={() => { setEditingOpex(null); setOpexForm({ opex_id: "", amount: "" }); setOpexModal(true); }}
                    >+ Add</button>
                 </div>
                 <div className="table-container" style={{marginTop:'0', border:'none', boxShadow:'none'}}>
                 <div className="premium-table-wrapper">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Opex Item</th>
                                <th>Amount/Batch</th>
                                <th style={{textAlign:'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productOpex.length === 0 ? (
                                <tr><td colSpan="3" className="empty-state">No Opex costs.</td></tr>
                            ) : (
                                productOpex.map(o => (
                                    <tr key={o.id}>
                                        <td style={{fontWeight:'600'}}>{o.opex_name}</td>
                                        <td>₦{Number(o.amount).toLocaleString()}</td>
                                        <td style={{textAlign:'right'}}>
                                            <div className="actions-cell">
                                                <button className="item-action-btn edit" onClick={() => { setEditingOpex(o); setOpexForm({ opex_id: o.opex_id, amount: o.amount }); setOpexModal(true); }}>Edit</button>
                                                <button className="item-action-btn delete" onClick={() => handleDeleteOpex(o)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                 </div>
                 </div>
             </div>
        </div>

        {/* Margin & Selling Price Configuration Card */}
        <div className="premium-card" style={{marginBottom:'24px'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                 <h3 style={{fontSize:'18px', fontWeight:'700', color:'yellow'}}>Margin & Selling Price Configuration</h3>
                 {!tcop ? (
                     <span style={{color: '#ef4444', fontSize: '13px', fontWeight: '500'}}>Compute cost first to enable auto-calculation</span>
                 ) : (
                     <span style={{color: '#10b981', fontSize: '13px', fontWeight: '500'}}>Auto-calculation enabled (TCOP: ₦{Number(tcop).toLocaleString()})</span>
                 )}
             </div>
             <div className="form-grid">
                 <div className="form-group">
                    <label className="premium-label-3">Margin % (0.x)</label>
                    <input 
                        className="premium-input"
                        type="number" 
                        value={marginPercent} 
                        onChange={e => handleMarginChange(e.target.value)} 
                        step="0.01" 
                        min="0" 
                        max="1" 
                        placeholder="e.g. 0.2"
                        disabled={savingSettings}
                    />
                 </div>
                 <div className="form-group">
                    <label className="premium-label-3">Selling Price (₦)</label>
                    <input 
                        className="premium-input"
                        type="number" 
                        value={sellingPrice} 
                        onChange={e => handleSellingPriceChange(e.target.value)} 
                        min="0" 
                        placeholder="e.g. 5000"
                        disabled={savingSettings}
                    />
                 </div>
             </div>
             <button 
                className="premium-btn primary"
                style={{marginTop:'20px', display:"flex" ,justifyContent:"center"}}
                onClick={handleSaveBatchMargin} 
                disabled={savingSettings}
             >
                {savingSettings ? "Saving Settings..." : "Save Margin & Price"}
             </button>
        </div>

        {/* Cost Analysis Panel */}
        <div className="premium-card" style={{borderLeft:'4px solid #d91f22'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                 <h3 style={{fontSize:'20px', fontWeight:'800', color:'yellow'}}>Cost Analysis</h3>
                 <button 
                    className="premium-btn primary"
                    onClick={handleComputeCost}
                    disabled={computingCost}
                 >
                    {computingCost ? "Computing..." : "Compute Cost"}
                 </button>
             </div>

             {costResult && !computingCost && (
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'32px'}}>
                    <div style={{ background:"white", padding:"25px", borderRadius:"10px", boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
                        <h4 style={{marginBottom:'16px', color:'#64748b'}}>Breakdown Per Unit (Pie)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={perUnitCostData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={80} 
                                    fill="#8884d8" 
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {perUnitCostData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <ReTooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                                <ReLegend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ background:"white", padding:"25px", borderRadius:"10px", boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
                        <h4 style={{marginBottom:'16px', color:'#64748b'}}>Breakdown Per Batch (Bar)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={perBatchCostData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ReTooltip formatter={(value) => `₦${round(value).toLocaleString()}`} />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{gridColumn:'1 / -1'}}>
                         <div className="table-container" style={{border:'none', boxShadow:'none', background:'#f8fafc', padding:'20px', borderRadius:'12px'}}>
                            <table className="premium-table" style={{background:'transparent'}}>
                                <thead>
                                    <tr>
                                        <th>Cost Component</th>
                                        <th>Per Unit (₦)</th>
                                        <th>Per Batch (₦)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Recipe Cost</td>
                                        <td>{round(costResult.recipe_cost).toLocaleString()}</td>
                                        <td>{round(costResult.recipe_cost * batchSize).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td>Packaging Cost</td>
                                        <td>{round(costResult.packaging_cost).toLocaleString()}</td>
                                        <td>{round(costResult.packaging_cost * batchSize).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td>Labour Cost</td>
                                        <td>{round(costResult.labour_cost).toLocaleString()}</td>
                                        <td>{round(costResult.labour_cost * batchSize).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td>OPEX Cost</td>
                                        <td>{round(costResult.opex_cost).toLocaleString()}</td>
                                        <td>{round(costResult.opex_cost * batchSize).toLocaleString()}</td>
                                    </tr>
                                    <tr style={{background:'#e2e8f0', fontWeight:'700'}}>
                                        <td>COGS (Total)</td>
                                        <td>{round(costResult.COGS).toLocaleString()}</td>
                                        <td>{round(costResult.COGS * batchSize).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td>Margin ({ (costResult.margin_percent * 100).toFixed(0) }%)</td>
                                        <td colSpan="2" style={{color:'#166534', fontWeight:'600'}}>
                                            Selling Price: ₦{round(costResult.selling_price || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                         </div>

                         <button 
                             className="submit-btn" 
                             style={{marginTop:'24px', width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}
                             onClick={handleSaveStandardCost}
                             disabled={standardizingCost}
                         >
                             {standardizingCost ? "Saving..." : "Save Standard Cost"}
                         </button>
                    </div>
                </div>
             )}
        </div>

        {/* --- Modals --- */}
        {/* Ingredient Modal */}
        <Modal visible={modalOpen} title={editLine ? "Edit Ingredient" : "Add Ingredient"} onClose={() => setModalOpen(false)}>
            <div className="vendor-form">
                <div className="form-group">
                    <label className="premium-label-2">Material</label>
                    <select className="premium-input" value={formData.material_id} onChange={e => setFormData({ ...formData, material_id: e.target.value })}>
                        <option value="">Select Material</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="premium-label-2">Quantity Per Batch</label>
                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        <input className="premium-input" type="number" value={formData.recipe_qty} onChange={e => setFormData({ ...formData, recipe_qty: e.target.value })} style={{flex:1}} />
                        <span style={{color:'#94a3b8', fontSize:'14px', fontWeight:'600', minWidth:'40px'}}>
                            {materials.find(m => m.id == formData.material_id)?.measurement_unit || ""}
                        </span>
                    </div>
                </div>
                <button className="submit-btn" onClick={handleSave} disabled={actionLoading}>{actionLoading ? "Saving..." : (editLine ? "Update" : "Save")}</button>
            </div>
        </Modal>

        {/* Packaging Modal */}
        <Modal visible={packagingModal} title={editingPackaging ? "Edit Packaging" : "Add Packaging"} onClose={() => setPackagingModal(false)}>
            <div className="vendor-form">
                <div className="form-group">
                    <label className="premium-label-2">Packaging</label>
                    <select className="premium-input" value={packForm.packaging_id} onChange={e => setPackForm({ ...packForm, packaging_id: e.target.value })}>
                        <option value="">Select Packaging</option>
                        {packagingList.map(p => <option key={p.id} value={p.id}>{p.name} (₦{p.cost_per_unit})</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="premium-label-2">Quantity</label>
                    <input className="premium-input" type="number" value={packForm.qty} onChange={e => setPackForm({ ...packForm, qty: e.target.value })} />
                </div>
                <button className="submit-btn" onClick={handleSavePackaging} disabled={actionLoading}>{actionLoading ? "Saving..." : (editingPackaging ? "Update" : "Save")}</button>
            </div>
        </Modal>

        {/* Labour Modal */}
        <Modal visible={labourModal} title={editingLabour ? "Edit Labour" : "Add Labour"} onClose={() => setLabourModal(false)}>
            <div className="vendor-form">
                <div className="form-group">
                    <label className="premium-label-2">Labour Item</label>
                    <select className="premium-input" value={labourForm.labour_id} onChange={e => {
                        const lid = e.target.value;
                        const item = labourList.find(l => l.id == lid);
                        let autoAmount = "";
                        if (item) {
                             // Calculate per-unit cost if estimated sales > 0
                             // Amount / Estimated Sales
                             if (Number(item.estimated_monthly_sales) > 0) {
                                 autoAmount = (Number(item.amount) / Number(item.estimated_monthly_sales)).toFixed(2);
                             }
                        }
                        setLabourForm({ ...labourForm, labour_id: lid, amount: autoAmount });
                    }}>
                        <option value="">Select Labour</option>
                        {labourList.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    {labourForm.amount && (
                        <div style={{marginTop:'8px', fontSize:'14px', color:'#94a3b8'}}>
                            Cost per unit: <span style={{color:'#4ade80', fontWeight:'700', fontSize:'16px'}}>₦{Number(labourForm.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                        </div>
                    )}
                </div>
                <button className="submit-btn" onClick={handleSaveLabour} disabled={actionLoading}>{actionLoading ? "Saving..." : (editingLabour ? "Update" : "Save")}</button>
            </div>
        </Modal>

        {/* Opex Modal */}
        <Modal visible={opexModal} title={editingOpex ? "Edit Opex" : "Add Opex"} onClose={() => setOpexModal(false)}>
            <div className="vendor-form">
                <div className="form-group">
                    <label className="premium-label-2">Opex Item</label>
                    <select className="premium-input" value={opexForm.opex_id} onChange={e => {
                         const oid = e.target.value;
                         const item = opexList.find(o => o.id == oid);
                         let autoAmount = "";
                         if (item) {
                             // Calculate per-unit cost i.e. (Amount / Estimated Sales) for fixed allocation
                             if (item.allocation_mode === 'fixed' && Number(item.estimated_monthly_sales) > 0) {
                                 autoAmount = (Number(item.amount) / Number(item.estimated_monthly_sales)).toFixed(2);
                             }
                         }
                         setOpexForm({ ...opexForm, opex_id: oid, amount: autoAmount });
                    }}>
                        <option value="">Select Opex</option>
                        {opexList.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    {opexForm.amount && (
                        <div style={{marginTop:'8px', fontSize:'14px', color:'#94a3b8'}}>
                            Cost per unit: <span style={{color:'#4ade80', fontWeight:'700', fontSize:'16px'}}>₦{Number(opexForm.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                        </div>
                    )}
                </div>
                <button className="submit-btn" onClick={handleSaveOpex} disabled={actionLoading}>{actionLoading ? "Saving..." : (editingOpex ? "Update" : "Save")}</button>
            </div>
        </Modal>

      </div>
    </Layout>
  );
};

export default RecipePage;