"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from "lucide-react";
import apiRequest from "../../lib/api";

export default function GalleryPage() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const data = await apiRequest.get("/gallery", { params: { search, limit: 100 } });
      if (data.success) {
        setGalleries(data.data);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch gallery posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGalleries();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gallery post?")) return;
    try {
      setActionLoading(id);
      const data = await apiRequest.delete(`/gallery/${id}`);
      if (data.success) {
        setGalleries((prev) => prev.filter((g) => g._id !== id || g.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      setActionLoading(id);
      const newStatus = currentStatus === "published" ? "draft" : "published";
      const data = await apiRequest.patch(`/gallery/${id}`, { status: newStatus });
      if (data.success) {
        setGalleries((prev) =>
          prev.map((g) => {
            const gid = g._id || g.id;
            return gid === id ? { ...g, status: newStatus } : g;
          })
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gallery Projects</h1>
          <p style={styles.subtitle}>Manage your luxury carpet project portfolio</p>
        </div>
        <Link href="/gallery/add" style={styles.addButton}>
          <Plus size={18} /> Add Project
        </Link>
      </div>

      <div style={styles.controls}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            <Search size={18} />
          </button>
        </form>
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loading}>Loading projects...</div>
        ) : galleries.length === 0 ? (
          <div style={styles.empty}>No projects found.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Project Title</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleries.map((item) => {
                const id = item._id || item.id;
                let imgSrc = item.featuredImage || (item.images && item.images[0]) || "";
                if (imgSrc && !imgSrc.startsWith("http") && !imgSrc.startsWith("data:")) {
                  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
                  imgSrc = imgSrc.startsWith("/") ? `${baseUrl}${imgSrc}` : `${baseUrl}/${imgSrc}`;
                }

                return (
                  <tr key={id} style={styles.tr}>
                    <td style={styles.td}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={item.title} style={styles.image} />
                      ) : (
                        <div style={styles.imagePlaceholder}>No Img</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.itemName}>{item.title}</div>
                    </td>
                    <td style={styles.td}>{item.category}</td>
                    <td style={styles.td}>{item.location || "-"}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(item.status === "published" ? styles.statusPub : styles.statusDraft),
                        }}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleStatusToggle(id, item.status)}
                          style={styles.iconBtn}
                          title={item.status === "published" ? "Unpublish" : "Publish"}
                          disabled={actionLoading === id}
                        >
                          {item.status === "published" ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <Link href={`/gallery/${id}`} style={styles.iconBtn}>
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(id)}
                          style={{ ...styles.iconBtn, color: "var(--primary-gold)" }}
                          disabled={actionLoading === id}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#fff",
    fontFamily: "var(--font-heading)",
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: "14px",
    marginTop: "4px",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--primary-gold)",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "background 0.2s",
  },
  controls: {
    marginBottom: "24px",
    display: "flex",
    gap: "16px",
  },
  searchForm: {
    display: "flex",
    flex: 1,
    maxWidth: "400px",
  },
  searchInput: {
    flex: 1,
    padding: "10px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px 0 0 8px",
    color: "#fff",
    outline: "none",
  },
  searchButton: {
    padding: "0 16px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderLeft: "none",
    borderRadius: "0 8px 8px 0",
    color: "#fff",
    cursor: "pointer",
  },
  tableContainer: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    color: "#a1a1aa",
    fontWeight: "500",
    fontSize: "14px",
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  td: {
    padding: "16px",
    color: "#e4e4e7",
    fontSize: "14px",
    verticalAlign: "middle",
  },
  image: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#a1a1aa",
  },
  itemName: {
    fontWeight: "500",
    color: "#fff",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusPub: {
    background: "rgba(34, 197, 94, 0.1)",
    color: "#4ade80",
  },
  statusDraft: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#a1a1aa",
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#a1a1aa",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#a1a1aa",
  },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#a1a1aa",
  },
};
