"use client";
import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Search, Filter, Plus, Package, AlertTriangle, TrendingDown, DollarSign, Download, Upload, X, RefreshCw, Archive, Edit3, Trash2, Warehouse, Box } from "lucide-react";
import MaterialsTab from "./components/MaterialsTab";
import AddMaterialModal from "./components/AddMaterialModal";

export default function InventoryPage() {
  const [stats, setStats] = useState(null);
  const [materialStats, setMaterialStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [refreshMaterialTrigger, setRefreshMaterialTrigger] = useState(0);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Adjust form state
  const [adjustData, setAdjustData] = useState({ quantity: 0, reason: "", costPrice: 0, price: 0, minStockLevel: 5 });

  const fileInputRef = useRef(null);

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split("\n").map(l => l.trim()).filter(l => l);
      if (lines.length < 2) return alert("Invalid CSV format");
      
      // Parse header row properly, handling quotes
      const parseCsvRow = (rowStr) => {
        const result = [];
        let cur = "", inQuotes = false;
        for (let i = 0; i < rowStr.length; i++) {
          if (rowStr[i] === '"') inQuotes = !inQuotes;
          else if (rowStr[i] === ',' && !inQuotes) { result.push(cur); cur = ""; }
          else cur += rowStr[i];
        }
        result.push(cur);
        return result.map(v => v.trim());
      };

      const headers = parseCsvRow(lines[0]);
      const skuIndex = headers.findIndex(h => h.includes("SKU"));
      const stockIndex = headers.findIndex(h => h.includes("Total Stock") || h.includes("Stock"));

      if (skuIndex === -1 || stockIndex === -1) {
        return alert("CSV must contain SKU and Total Stock columns");
      }

      const updates = [];
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvRow(lines[i]);
        const sku = row[skuIndex];
        const stock = parseInt(row[stockIndex], 10);
        
        if (sku && !isNaN(stock)) {
          updates.push({ sku, stock, notes: "CSV Import" });
        }
      }

      if (updates.length === 0) return alert("No valid stock updates found");

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/inventory/bulk`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` 
          },
          body: JSON.stringify({ updates })
        });
        const data = await res.json();
        if (data.success) {
          alert(`Successfully updated ${data.results.filter(r => !r.error).length} products.`);
          fetchInventory();
          fetchStats();
        } else alert(data.message || "Import failed");
      } catch (err) {
        alert("Import failed due to server error");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  useEffect(() => {
    fetchStats();
    fetchMaterialStats();
  }, []);

  useEffect(() => {
    if (refreshMaterialTrigger > 0) {
      fetchMaterialStats();
    }
  }, [refreshMaterialTrigger]);

  useEffect(() => {
    fetchInventory();
  }, [page, limit, search, statusFilter]);

  const fetchStats = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/inventory/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterialStats = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/materials/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` }
      });
      const data = await res.json();
      if (data.success) setMaterialStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/inventory?page=${page}&limit=${limit}&search=${search}&stockStatus=${statusFilter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const openAdjustModal = (product) => {
    setSelectedProduct(product);
    setAdjustData({
      quantity: 0,
      reason: "",
      costPrice: product.costPrice || 0,
      price: product.price || 0,
      minStockLevel: product.minimumStock || product.minStockLevel || 5
    });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/inventory/adjust`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` 
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantity: adjustData.quantity,
          reason: adjustData.reason,
          costPrice: adjustData.costPrice,
          price: adjustData.price,
          minStockLevel: adjustData.minStockLevel,
          type: adjustData.quantity > 0 ? "purchase" : "damage"
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdjustModalOpen(false);
        fetchInventory();
        fetchStats();
      } else {
        alert(data.message || "Failed to adjust stock");
      }
    } catch (err) {
      alert("Error adjusting stock");
    }
  };

  const exportCSV = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/inventory/export`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventory_export.csv";
        a.click();
      }
    } catch (err) {
      alert("Export failed");
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Inventory Management</h2>
            <p style={styles.subtitle}>Track products, manage stock levels, and monitor inventory value.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {activeTab === "materials" ? (
              <button className="btn btn-primary" onClick={() => setIsAddMaterialModalOpen(true)}>
                <Warehouse size={16} /> Add Material
              </button>
            ) : null}
            <button className="btn btn-secondary" onClick={exportCSV}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div style={styles.statsGrid}>
          <StatCard 
            title={activeTab === "products" ? "Total Products" : "Total Materials"} 
            value={activeTab === "products" ? (stats?.total || 0) : (materialStats?.total || 0)} 
            icon={activeTab === "products" ? Package : Warehouse} 
            color="#1E40AF" bgColor="#DBEAFE" 
            isLoading={activeTab === "products" ? stats === null : materialStats === null}
          />
          <StatCard 
            title={activeTab === "products" ? "In Stock" : "Total Quantity"} 
            value={activeTab === "products" ? (stats?.inStock || 0) : (materialStats?.totalQuantityString || "0")} 
            icon={Package} color="#065F46" bgColor="#D1FAE5" 
            isLoading={activeTab === "products" ? stats === null : materialStats === null}
          />
          <StatCard 
            title="Low Stock" 
            value={activeTab === "products" ? (stats?.lowStock || 0) : (materialStats?.lowStock || 0)} 
            icon={AlertTriangle} color="#92400E" bgColor="#FEF3C7" 
            isLoading={activeTab === "products" ? stats === null : materialStats === null}
          />
          <StatCard 
            title="Out of Stock" 
            value={activeTab === "products" ? (stats?.outOfStock || 0) : (materialStats?.outOfStock || 0)} 
            icon={TrendingDown} color="#991B1B" bgColor="#FEE2E2" 
            isLoading={activeTab === "products" ? stats === null : materialStats === null}
          />
          <StatCard 
            title={activeTab === "products" ? "Inventory Value" : "Stock Value"} 
            value={`₹${((activeTab === "products" ? stats?.inventoryValue : materialStats?.inventoryValue) || 0).toLocaleString()}`} 
            icon={DollarSign} color="#4C1D95" bgColor="#EDE9FE" 
            isLoading={activeTab === "products" ? stats === null : materialStats === null}
          />
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <button 
            style={activeTab === "products" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => setActiveTab("products")}
          >
            <Package size={16} /> Products
          </button>
          <button 
            style={activeTab === "materials" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => setActiveTab("materials")}
          >
            <Box size={16} /> Raw Materials
          </button>
        </div>

        {activeTab === "products" ? (
          <div>
            {/* Filters */}
            <div style={styles.filterBar}>
              <div style={styles.filtersWrapper}>
                <div style={styles.searchBox}>
                  <Search size={16} style={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Search by product name or SKU..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                <select 
                  style={styles.select} 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Available</th>
                    <th>Reserved</th>
                    <th>Total Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>Loading...</td></tr>
                  ) : products.map(product => {
                    const available = (product.stock || 0) - (product.reservedStock || 0);
                    const isLow = available > 0 && available <= (product.minimumStock || product.minStockLevel || 5);
                    const isOut = available <= 0;
                    
                    return (
                      <tr key={product._id}>
                        <td>
                          <div style={styles.productCell}>
                            <img 
                              src={product.thumbnail?.path ? (product.thumbnail.path.startsWith("http") ? product.thumbnail.path : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "")}${product.thumbnail.path}`) : "/placeholder.jpg"} 
                              alt={product.title || product.name} 
                              style={styles.productImg} 
                            />
                            <span style={{ fontWeight: 500 }}>{product.name || product.title}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{product.sku || "-"}</td>
                        <td style={{ fontWeight: 600 }}>{available}</td>
                        <td style={{ color: "var(--text-muted)" }}>{product.reservedStock || 0}</td>
                        <td>{product.stock || 0}</td>
                        <td>₹{(product.price || 0).toLocaleString()}</td>
                        <td>
                          {isOut ? (
                            <span style={{ ...styles.badge, ...styles.badgeRed }}>Out of Stock</span>
                          ) : isLow ? (
                            <span style={{ ...styles.badge, ...styles.badgeOrange }}>Low Stock</span>
                          ) : (
                            <span style={{ ...styles.badge, ...styles.badgeGreen }}>In Stock</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button style={styles.actionBtn} onClick={() => openDrawer(product)}>Details</button>
                            <button style={styles.actionBtn} onClick={() => openAdjustModal(product)}>Adjust</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div style={styles.pagination}>
                  <button 
                    style={styles.pageBtn} 
                    disabled={page === 1} 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
                  <button 
                    style={styles.pageBtn} 
                    disabled={page === totalPages} 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <MaterialsTab refreshTrigger={refreshMaterialTrigger} />
        )}

        {/* Adjust Stock Modal */}
        {isAdjustModalOpen && selectedProduct && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0 }}>Adjust Stock: {selectedProduct.name}</h3>
                <button onClick={() => setIsAdjustModalOpen(false)} style={styles.closeBtn}><X size={18} /></button>
              </div>
              <form onSubmit={handleAdjustSubmit} style={styles.modalBody}>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity to Add/Remove (Use negative for removing)</label>
                  <input 
                    type="number" 
                    style={styles.input} 
                    value={adjustData.quantity}
                    onChange={(e) => setAdjustData({...adjustData, quantity: e.target.value})}
                    required
                  />
                  <small style={{ color: "var(--text-muted)" }}>Current total stock: {selectedProduct.stock}</small>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Reason / Notes</label>
                  <input 
                    type="text" 
                    style={styles.input} 
                    value={adjustData.reason}
                    onChange={(e) => setAdjustData({...adjustData, reason: e.target.value})}
                    placeholder="e.g. Supplier delivery, damage write-off"
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cost Price (₹)</label>
                    <input 
                      type="number" 
                      style={styles.input} 
                      value={adjustData.costPrice}
                      onChange={(e) => setAdjustData({...adjustData, costPrice: e.target.value})}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Selling Price (₹)</label>
                    <input 
                      type="number" 
                      style={styles.input} 
                      value={adjustData.price}
                      onChange={(e) => setAdjustData({...adjustData, price: e.target.value})}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Min Stock Alert Level</label>
                  <input 
                    type="number" 
                    style={styles.input} 
                    value={adjustData.minStockLevel}
                    onChange={(e) => setAdjustData({...adjustData, minStockLevel: e.target.value})}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAdjustModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Adjustment</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Details Drawer */}
        {isDrawerOpen && selectedProduct && (
          <div style={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
            <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
              <div style={styles.drawerHeader}>
                <h3 style={{ margin: 0 }}>Product Details</h3>
                <button onClick={() => setIsDrawerOpen(false)} style={styles.closeBtn}><X size={20} /></button>
              </div>
              <div style={styles.drawerBody}>
                <img 
                  src={selectedProduct.thumbnail?.path ? (selectedProduct.thumbnail.path.startsWith("http") ? selectedProduct.thumbnail.path : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "")}${selectedProduct.thumbnail.path}`) : "/placeholder.jpg"} 
                  alt={selectedProduct.name} 
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "15px" }} 
                />
                <h2 style={{ fontSize: "20px", marginBottom: "5px" }}>{selectedProduct.name || selectedProduct.title}</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>SKU: {selectedProduct.sku || "N/A"}</p>
                
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Available Stock</span>
                    <span style={{ ...styles.detailValue, fontSize: "24px", color: "var(--primary-color)" }}>
                      {(selectedProduct.stock || 0) - (selectedProduct.reservedStock || 0)}
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Reserved</span>
                    <span style={styles.detailValue}>{selectedProduct.reservedStock || 0}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Cost Price</span>
                    <span style={styles.detailValue}>₹{selectedProduct.costPrice || 0}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Selling Price</span>
                    <span style={styles.detailValue}>₹{selectedProduct.price || 0}</span>
                  </div>
                </div>

                <div style={{ marginTop: "30px" }}>
                  <h4 style={{ marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>Movement History</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    Fetching exact history requires an additional API call to <br/>
                    <code>/api/inventory/movements?productId={selectedProduct._id}</code>.<br/><br/>
                    In a production app, a list of movements (Sale, Purchase, Adjustments) would render here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAddMaterialModalOpen && (
        <AddMaterialModal 
          onClose={() => setIsAddMaterialModalOpen(false)} 
          onSave={() => {
            setRefreshMaterialTrigger(prev => prev + 1);
            setIsAddMaterialModalOpen(false);
          }}
        />
      )}
    </AdminLayout>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color, bgColor, isLoading }) {
  return (
    <div style={styles.statCard} >
      <div style={{ ...styles.iconWrapper, backgroundColor: bgColor, color }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={styles.statTitle}>{title}</p>
        {isLoading ? (
          <div style={styles.skeleton} />
        ) : (
          <h3 style={styles.statValue}>{value}</h3>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 4px 0",
    color: "var(--text-primary)",
  },
  skeleton: {
    height: "28px",
    width: "80px",
    backgroundColor: "var(--border-color)",
    borderRadius: "4px",
    animation: "pulse 1.5s infinite",
    opacity: 0.7
  },
  subtitle: {
    margin: 0,
    color: "var(--text-muted)",
    fontSize: "14px",
  },
  tabsContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "10px",
    flexWrap: "wrap"
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "transparent",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text-muted)",
    cursor: "pointer",
    borderRadius: "6px"
  },
  activeTab: {
    background: "var(--primary-brand)",
    color: "white",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "var(--bg-primary)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statTitle: {
    margin: "0 0 4px 0",
    color: "var(--text-muted)",
    fontSize: "13px",
    fontWeight: 500,
  },
  statValue: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold",
    color: "var(--text-primary)",
  },
  filterBar: { padding: "18px 22px", borderRadius: "var(--border-radius)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", flexWrap: "wrap", marginBottom: "4px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xs)" },
  filtersWrapper: { display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", flex: 1 },
  searchBox: { position: "relative", flex: 1, display: "flex", alignItems: "center", minWidth: "280px" },
  searchInput: { width: "100%", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "9px 12px 9px 40px", fontSize: "14px", color: "var(--text-primary)", outline: "none" },
  searchIcon: { position: "absolute", left: "14px", color: "var(--text-muted)" },
  select: { border: "none", backgroundColor: "transparent", padding: "9px 30px 9px 12px", fontSize: "13px", outline: "none", cursor: "pointer", borderLeft: "1px solid var(--border-color)" },
  tableCard: {
    backgroundColor: "var(--bg-primary)",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  productCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  productImg: {
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    objectFit: "cover",
    backgroundColor: "var(--bg-secondary)",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  badgeGreen: { color: "var(--success)" },
  badgeOrange: { color: "var(--warning)" },
  badgeRed: { color: "var(--danger)" },
  actionBtn: {
    padding: "4px 10px",
    fontSize: "12px",
    borderRadius: "4px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    cursor: "pointer",
    fontWeight: 500,
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    borderTop: "1px solid var(--border-color)",
  },
  pageBtn: {
    padding: "6px 12px",
    border: "1px solid var(--border-color)",
    borderRadius: "4px",
    backgroundColor: "var(--bg-primary)",
    cursor: "pointer",
  },
  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "var(--bg-primary)",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    overflow: "hidden",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    padding: "20px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalBody: {
    padding: "20px",
  },
  closeBtn: {
    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)"
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-primary)",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  // Drawer Styles
  drawerOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
  },
  drawer: {
    width: "400px",
    height: "100%",
    backgroundColor: "var(--bg-primary)",
    boxShadow: "-4px 0 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    animation: "slideIn 0.3s ease-out forwards",
  },
  drawerHeader: {
    padding: "20px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerBody: {
    padding: "20px",
    overflowY: "auto",
    flex: 1,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  detailItem: {
    backgroundColor: "var(--bg-secondary)",
    padding: "15px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
  },
  detailLabel: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginBottom: "4px",
  },
  detailValue: {
    fontSize: "16px",
    fontWeight: "bold",
  }
};
