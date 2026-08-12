"use client";

import React, { useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X, GripVertical } from "lucide-react";
import Link from "next/link";
import apiRequest from "../../../lib/api";

export default function AddGalleryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    category: "Residential",
    clientName: "",
    location: "",
    completionDate: "",
    carpetType: "",
    areaCovered: "",
    designer: "",
    technique: "",
    materials: "",
    tags: "",
    badge: "",
    isFeatured: false,
    status: "published",
    displayOrder: 0,
    seoTitle: "",
    seoDescription: "",
    imageAltText: "",
    instagramUrl: "",
  });

  const [images, setImages] = useState([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);

  const categories = ["Residential", "Commercial", "Hotels", "Villas", "Mosques", "Offices", "Exhibitions", "Events", "Behind the Scenes"];
  const badges = ["", "Featured", "New", "Completed Project", "Installation", "Exhibition", "Luxury"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const token = localStorage.getItem("artistic_carpets_admin_token");
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const uploadedUrls = [];

    for (const file of files) {
      const data = new FormData();
      data.append("file", file);
      
      try {
        const res = await fetch(`${baseUrl}/media/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });
        const result = await res.json();
        if (result.success && result.media) {
          uploadedUrls.push(result.media.path);
        }
      } catch (err) {
        console.error("Upload error", err);
      }
    }
    
    setImages((prev) => {
      const newImages = [...prev, ...uploadedUrls];
      if (!featuredImage && newImages.length > 0) {
        setFeaturedImage(newImages[0]);
      }
      return newImages;
    });
    setUploading(false);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const removed = newImages.splice(index, 1)[0];
    setImages(newImages);
    if (featuredImage === removed && newImages.length > 0) {
      setFeaturedImage(newImages[0]);
    } else if (newImages.length === 0) {
      setFeaturedImage("");
    }
  };

  const onDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const newImages = [...images];
    const draggedImg = newImages[draggedIdx];
    newImages.splice(draggedIdx, 1);
    newImages.splice(index, 0, draggedImg);
    
    setDraggedIdx(index);
    setImages(newImages);
  };

  const onDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        materials: formData.materials.split(",").map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(",").map(s => s.trim()).filter(Boolean),
        displayOrder: Number(formData.displayOrder),
        images,
        featuredImage,
      };

      const data = await apiRequest.post("/gallery", payload);
      if (data.success) {
        alert("Project added successfully!");
        router.push("/gallery");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link href="/gallery" style={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={styles.title}>Add Gallery Project</h1>
            <p style={styles.subtitle}>Create a new portfolio entry</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button onClick={handleSubmit} disabled={saving} style={styles.saveBtn}>
            <Save size={18} />
            {saving ? "Saving..." : "Save Project"}
          </button>
        </div>
      </div>

      <div style={styles.formGrid}>
        {/* Left Column */}
        <div style={styles.mainCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Basic Information</h2>
            
            <div style={styles.field}>
              <label style={styles.label}>Project Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
                placeholder="Royal Palace Lobby Installation"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Short Description</label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                style={styles.textarea}
                rows={2}
                placeholder="Handcrafted floral wool carpet installed in a luxury hotel..."
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Full Description (Project Story)</label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleChange}
                style={styles.textarea}
                rows={6}
                placeholder="Write the full story, inspiration, and craftsmanship details..."
              />
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Images & Media</h2>
            <p style={{ color: "#a1a1aa", fontSize: "13px", marginBottom: "16px" }}>
              Upload images. Drag and drop to reorder. The first image or selected one acts as the featured image.
            </p>
            
            <div style={styles.uploadArea}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="gallery-images"
              />
              <label htmlFor="gallery-images" style={styles.uploadLabel}>
                <Upload size={24} style={{ marginBottom: "8px", color: "var(--primary-gold)" }} />
                <span style={{ color: "#fff", fontWeight: "500" }}>
                  {uploading ? "Uploading..." : "Click to upload images"}
                </span>
              </label>
            </div>

            {images.length > 0 && (
              <div style={styles.imageList}>
                {images.map((img, idx) => {
                  let imgSrc = img;
                  if (!imgSrc.startsWith("http") && !imgSrc.startsWith("data:")) {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
                    imgSrc = imgSrc.startsWith("/") ? `${baseUrl}${imgSrc}` : `${baseUrl}/${imgSrc}`;
                  }
                  const isFeatured = img === featuredImage;

                  return (
                    <div 
                      key={idx} 
                      style={styles.imageItem}
                      draggable
                      onDragStart={(e) => onDragStart(e, idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={onDragEnd}
                    >
                      <div style={styles.dragHandle}>
                        <GripVertical size={16} />
                      </div>
                      <img src={imgSrc} alt="Gallery" style={styles.imgPreview} />
                      
                      <div style={styles.imgActions}>
                        <label style={{ fontSize: "13px", color: "#fff", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                          <input 
                            type="radio" 
                            name="featuredImg" 
                            checked={isFeatured}
                            onChange={() => setFeaturedImage(img)}
                          />
                          Featured
                        </label>
                        <button onClick={() => removeImage(idx)} style={styles.removeImgBtn} title="Remove image">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Project Details</h2>
            
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Client Name</label>
                <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} style={styles.input} placeholder="e.g. Dubai, UAE" />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Completion Date</label>
                <input type="text" name="completionDate" value={formData.completionDate} onChange={handleChange} style={styles.input} placeholder="e.g. March 2026" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Area Covered</label>
                <input type="text" name="areaCovered" value={formData.areaCovered} onChange={handleChange} style={styles.input} placeholder="e.g. 500 sq.m" />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Carpet Type</label>
                <input type="text" name="carpetType" value={formData.carpetType} onChange={handleChange} style={styles.input} placeholder="e.g. Hand Tufted Wool" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Designer</label>
                <input type="text" name="designer" value={formData.designer} onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Technique</label>
              <input type="text" name="technique" value={formData.technique} onChange={handleChange} style={styles.input} />
            </div>

            <div className="field" style={styles.field}>
              <label style={styles.label}>Instagram Post URL</label>
              <input type="text" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} style={styles.input} placeholder="https://www.instagram.com/p/..." />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Materials (comma separated)</label>
              <input type="text" name="materials" value={formData.materials} onChange={handleChange} style={styles.input} placeholder="Wool, Silk, Gold Thread" />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} style={styles.input} placeholder="Custom Design, Eco Friendly, Fire Resistant" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.sideCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Organization</h2>
            
            <div style={styles.field}>
              <label style={styles.label}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} style={styles.select}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} style={styles.select}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Badge</label>
              <select name="badge" value={formData.badge} onChange={handleChange} style={styles.select}>
                {badges.map((b) => (
                  <option key={b} value={b}>{b || "None"}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label} style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#fff'}}>
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                Featured Project
              </label>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Display Order</label>
              <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>SEO Settings</h2>
            
            <div style={styles.field}>
              <label style={styles.label}>SEO Title</label>
              <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleChange} style={styles.input} />
            </div>
            
            <div style={styles.field}>
              <label style={styles.label}>SEO Description</label>
              <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} style={styles.textarea} rows={3} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Image Alt Text</label>
              <input type="text" name="imageAltText" value={formData.imageAltText} onChange={handleChange} style={styles.input} />
            </div>
          </div>
        </div>
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
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    transition: "background 0.2s",
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
  headerRight: {
    display: "flex",
    gap: "12px",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--primary-gold)",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  formGrid: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
  },
  mainCol: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sideCol: {
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "24px",
  },
  cardTitle: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    fontFamily: "var(--font-heading)",
  },
  field: {
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    gap: "16px",
  },
  label: {
    display: "block",
    color: "#a1a1aa",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#fff",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#fff",
    outline: "none",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#fff",
    outline: "none",
  },
  uploadArea: {
    width: "100%",
    padding: "40px",
    border: "2px dashed rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "rgba(255, 255, 255, 0.02)",
    marginBottom: "20px",
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
  },
  imageList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  imageItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.05)",
    cursor: "grab",
  },
  dragHandle: {
    color: "#a1a1aa",
    cursor: "grab",
  },
  imgPreview: {
    width: "60px",
    height: "60px",
    borderRadius: "6px",
    objectFit: "cover",
  },
  imgActions: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  removeImgBtn: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "none",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
};
