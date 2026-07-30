import React, { useState, useEffect } from "react";
import { Search, Edit3, Trash2, Box, Package } from "lucide-react";
import Link from "next/link";
import UpdateStockModal from "./UpdateStockModal";

export default function MaterialsTab({ refreshTrigger }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [stockModalMaterial, setStockModalMaterial] = useState(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      let url = `${baseUrl}/materials?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [page, search, statusFilter, refreshTrigger]);

  return (
    <div>
      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.filtersWrapper}>
          <div style={styles.searchBox}>
            <Search size={16} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by material name or code..." 
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Code</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Loading materials...</td></tr>
            ) : materials.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  <Box size={40} color="var(--border-color)" style={{ marginBottom: "10px" }} />
                  <p style={{ margin: 0, color: "var(--text-muted)" }}>No materials found</p>
                </td>
              </tr>
            ) : (
              materials.map((mat) => (
                <tr key={mat._id}>
                  <td>
                    <div style={styles.productCell}>
                      <span style={{ fontWeight: 500 }}>{mat.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{mat.code}</td>
                  <td>{mat.category || "-"}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: mat.currentStock <= mat.minStockLevel ? "var(--danger)" : "var(--success)" }}>
                      {mat.currentStock} {mat.unit}
                    </span>
                  </td>
                  <td>
                    <span style={mat.status === "active" ? styles.badgeGreen : styles.badgeRed}>
                      {mat.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        style={styles.actionBtn} 
                        onClick={() => setStockModalMaterial(mat)}
                      >
                        Update Stock
                      </button>
                      <Link href={`/inventory/materials/${mat._id}`} style={styles.actionBtn}>
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
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

      {stockModalMaterial && (
        <UpdateStockModal 
          material={stockModalMaterial}
          onClose={() => setStockModalMaterial(null)}
          onSave={() => {
            setStockModalMaterial(null);
            fetchMaterials();
          }}
        />
      )}
    </div>
  );
}

const styles = {
  filterBar: { padding: "18px 22px", borderRadius: "var(--border-radius)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", flexWrap: "wrap", marginBottom: "4px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xs)" },
  filtersWrapper: { display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", flex: 1 },
  searchBox: { position: "relative", flex: 1, display: "flex", alignItems: "center", minWidth: "280px" },
  searchInput: { width: "100%", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "9px 12px 9px 40px", fontSize: "14px", color: "var(--text-primary)", outline: "none" },
  searchIcon: { position: "absolute", left: "14px", color: "var(--text-muted)" },
  select: { border: "none", backgroundColor: "transparent", padding: "9px 30px 9px 12px", fontSize: "13px", outline: "none", cursor: "pointer", borderLeft: "1px solid var(--border-color)" },
  productCell: { display: "flex", alignItems: "center", gap: "12px" },
  productImg: { width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", backgroundColor: "var(--bg-secondary)" },
  badgeGreen: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block", color: "var(--success)" },
  badgeRed: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block", color: "var(--danger)" },
  actionBtn: { padding: "4px 10px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-secondary)", cursor: "pointer", fontWeight: 500, color: "var(--text-primary)", textDecoration: "none", display: "inline-block" },
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderTop: "1px solid var(--border-color)" },
  pageBtn: { padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "4px", backgroundColor: "var(--bg-primary)", cursor: "pointer", color: "var(--text-primary)" },
};
