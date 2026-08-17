"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Archive, Eye, Search, AlertCircle, RefreshCw, Package, ArrowLeft } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

// Robust image URL helper
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api-artisticcarpets.nexcorealliance.com/api";
  if (baseUrl.endsWith("/api")) baseUrl = baseUrl.slice(0, -4);
  else if (baseUrl.endsWith("/api/")) baseUrl = baseUrl.slice(0, -5);
  return `${baseUrl}${path}`;
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Construct query string based on filters
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      let url = `${baseUrl}/products/admin-list?limit=100`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      if (searchTerm) {
        url += `&keyword=${encodeURIComponent(searchTerm)}`;
      }

      const token = localStorage.getItem("artistic_carpets_admin_token");
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setProducts(data.data?.products || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts();
  }, [statusFilter, searchTerm]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      setActionLoading(id);
      const token = localStorage.getItem("artistic_carpets_admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete product");

      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert("Error deleting product: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (id, currentStatus) => {
    const isArchiving = currentStatus !== "archived";
    const action = isArchiving ? "archive" : "restore";

    if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;

    try {
      setActionLoading(id);
      const token = localStorage.getItem("artistic_carpets_admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/products/${id}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error(`Failed to ${action} product`);

      // Update locally
      fetchProducts();
    } catch (err) {
      alert(`Error ${action}ing product: ` + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: "var(--color-success-light)", text: "var(--color-success)" },
      draft: { bg: "var(--color-warning-light)", text: "var(--color-warning)" },
      inactive: { bg: "var(--bg-secondary)", text: "var(--text-secondary)" },
      archived: { bg: "var(--bg-secondary)", text: "var(--text-muted)" }
    };
    const style = styles[status] || styles.inactive;
    return (
      <span style={{
        padding: "4px 8px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: style.bg,
        color: style.text,
        textTransform: "capitalize"
      }}>
        {status}
      </span>
    );
  };

  const getStockBadge = (stock) => {
    if (stock > 5) return <span style={{ color: "var(--color-success)", fontWeight: 500 }}>{stock} in stock</span>;
    if (stock > 0) return <span style={{ color: "var(--color-warning)", fontWeight: 500 }}>{stock} Low Stock</span>;
    return <span style={{ color: "var(--color-danger)", fontWeight: 500 }}>Out of Stock</span>;
  };

  return (
    <AdminLayout>
      <div style={pageStyles.container}>
        {/* Title & Navigation */}
        <div style={pageStyles.header}>
          <div>
            <h2 style={pageStyles.title}>Products Management</h2>
            <p style={pageStyles.subtitle}>
              Search, filter, and manage platform products ({products.length} total)
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="btn btn-secondary"
            style={pageStyles.refreshBtn}
          >
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={pageStyles.filterBar}>
          <div style={pageStyles.searchBox}>
            <Search size={16} style={pageStyles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={pageStyles.searchInput}
            />
          </div>
          <div style={pageStyles.actionGroup}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={pageStyles.select}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <Link href="/products/new" style={pageStyles.addButton}>
              <Plus size={15} />
              <span className="hidden sm:inline" style={{ marginLeft: "4px" }}>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={pageStyles.errorBox}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={fetchProducts} style={pageStyles.retryBtn}>Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="table-container">
          {isLoading ? (
            <div style={pageStyles.loadingState}>
              <RefreshCw size={24} className="spin" color="var(--primary-brand)" />
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={pageStyles.emptyState}>
              <Package size={48} color="var(--border-color)" />
              <h3>No products found</h3>
              <p>Try adjusting your search or add a new product.</p>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={pageStyles.productCell}>
                        <div style={pageStyles.imgWrapper}>
                          {product.thumbnail?.path ? (
                            <img
                              src={getImageUrl(product.thumbnail.path)}
                              alt={product.title}
                              style={pageStyles.img}
                            />
                          ) : (
                            <div style={pageStyles.imgPlaceholder}>No Img</div>
                          )}
                        </div>
                        <div>
                          <div style={pageStyles.productTitle}>{product.title}</div>
                          <div style={pageStyles.productSku}>{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={pageStyles.category}>{product.category}</span>
                      {product.productCollection && <span style={pageStyles.collection}>{product.productCollection}</span>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{product.price?.toFixed(2)}</div>
                      {product.discountPrice && (
                        <div style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                          ₹{product.discountPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>{getStockBadge(product.stock)}</td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={pageStyles.actions}>
                        <Link href={`/products/${product._id}`} style={pageStyles.iconBtn} title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleArchive(product._id, product.status)}
                          style={pageStyles.iconBtn}
                          disabled={actionLoading === product._id}
                          title={product.status === "archived" ? "Restore" : "Archive"}
                        >
                          <Archive size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          style={{ ...pageStyles.iconBtn, color: "var(--color-danger)" }}
                          disabled={actionLoading === product._id}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!isLoading && products.length > 10 && (
            <div style={pageStyles.paginationContainer}>
              <button
                style={{ ...pageStyles.paginationBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </button>
              <span style={pageStyles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                style={{ ...pageStyles.paginationBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
      </div>
    </AdminLayout>
  );
}

const pageStyles = {
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    fontFamily: "var(--font-serif)",
    color: "#1a1a1a",
  },
  container: {
    display: "flex",
    flexDirection: "column",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
  paginationBtn: {
    padding: "8px 16px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    transition: "all 0.2s ease"
  },
  paginationInfo: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500"
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "28px" },
  title: { fontSize: "28px", fontWeight: "700" },
  subtitle: { fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" },
  refreshBtn: { padding: "9px 15px", fontSize: "13px" },
  filterBar: { padding: "18px 22px", borderRadius: "var(--border-radius)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", flexWrap: "wrap", marginBottom: "4px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xs)" },
  actionGroup: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "nowrap", flex: "0 0 auto", overflowX: "auto" },
  searchBox: { position: "relative", flex: "1 1 auto", display: "flex", alignItems: "center", minWidth: "200px" },
  searchInput: { width: "100%", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "9px 12px 9px 40px", fontSize: "14px", color: "var(--text-primary)", outline: "none" },
  searchIcon: { position: "absolute", left: "14px", color: "var(--text-muted)" },
  select: { border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", backgroundColor: "var(--bg-primary)", padding: "9px 30px 9px 12px", fontSize: "13px", outline: "none", cursor: "pointer" },
  addButton: { padding: "9px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "var(--primary-brand)", color: "white", borderRadius: "var(--border-radius-sm)", textDecoration: "none", fontWeight: "500", transition: "var(--transition-fast)", whiteSpace: "nowrap" },

  productCell: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  imgWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "var(--bg-secondary)",
    flexShrink: 0,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    color: "var(--text-muted)",
  },
  productTitle: {
    fontWeight: "600",
    color: "var(--text-primary)",
    fontSize: "14px",
    marginBottom: "2px",
  },
  productSku: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  category: {
    display: "block",
    fontWeight: "500",
    fontSize: "14px",
  },
  collection: {
    display: "block",
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
  },
  iconBtn: {
    padding: "8px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "var(--border-radius-sm)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition-fast)",
  },
  errorBox: {
    padding: "16px",
    backgroundColor: "var(--color-danger-light)",
    color: "var(--color-danger)",
    borderRadius: "var(--border-radius-sm)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  retryBtn: {
    marginLeft: "auto",
    padding: "6px 12px",
    background: "var(--color-danger)",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  loadingState: {
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    color: "var(--text-muted)",
  },
  emptyState: {
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    color: "var(--text-muted)",
    textAlign: "center",
  }
};
