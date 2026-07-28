"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Search, Filter, Plus, Package, AlertTriangle, TrendingDown, DollarSign, Download, Upload, X, RefreshCw, Archive, Edit3, Trash2 } from "lucide-react";

export default function InventoryPage() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Adjust form state
  const [adjustData, setAdjustData] = useState({ quantity: 0, reason: "", costPrice: 0, price: 0, minStockLevel: 5 });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [page, limit, search, statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/inventory/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/inventory?page=${page}&limit=${limit}&search=${search}&stockStatus=${statusFilter}`, {
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
      const res = await fetch("http://127.0.0.1:5000/api/inventory/adjust", {
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
      const res = await fetch("http://127.0.0.1:5000/api/inventory/export", {
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
            <button className="btn btn-secondary" onClick={exportCSV}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => alert("Import feature coming soon!")}>
              <Upload size={16} /> Import
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div style={styles.statsGrid}>
          <StatCard title="Total Products" value={stats?.total || 0} icon={Package} color="#1E40AF" bgColor="#DBEAFE" />
          <StatCard title="In Stock" value={stats?.inStock || 0} icon={Package} color="#065F46" bgColor="#D1FAE5" />
          <StatCard title="Low Stock" value={stats?.lowStock || 0} icon={AlertTriangle} color="#92400E" bgColor="#FEF3C7" />
          <StatCard title="Out of Stock" value={stats?.outOfStock || 0} icon={TrendingDown} color="#991B1B" bgColor="#FEE2E2" />
          <StatCard title="Inventory Value" value={`₹${(stats?.inventoryValue || 0).toLocaleString()}`} icon={DollarSign} color="#4C1D95" bgColor="#EDE9FE" />
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by product name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        {/* Inventory Table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
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
                          src={product.mainImage?.path ? `http://localhost:5000${product.mainImage.path}` : "/placeholder.jpg"} 
                          alt={product.name} 
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
          <div style={styles.pagination}>
            <button 
              style={styles.pageBtn} 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button 
              style={styles.pageBtn} 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => p + 1)}
            >Next</button>
          </div>
        </div>

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
                  src={selectedProduct.mainImage?.path ? `http://localhost:5000${selectedProduct.mainImage.path}` : "/placeholder.jpg"} 
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
                  {/* Since Movement History is an API call, we would normally fetch it here. For UI purposes, we'll show a placeholder text */}
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
    </AdminLayout>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.iconWrapper, backgroundColor: bgColor, color }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={styles.statTitle}>{title}</p>
        <h3 style={styles.statValue}>{value}</h3>
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
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 4px 0",
    color: "var(--text-primary)",
  },
  subtitle: {
    margin: 0,
    color: "var(--text-muted)",
    fontSize: "14px",
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
  filters: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  select: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    outline: "none",
  },
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
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 500,
  },
  badgeGreen: { backgroundColor: "#D1FAE5", color: "#065F46" },
  badgeOrange: { backgroundColor: "#FEF3C7", color: "#92400E" },
  badgeRed: { backgroundColor: "#FEE2E2", color: "#991B1B" },
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
