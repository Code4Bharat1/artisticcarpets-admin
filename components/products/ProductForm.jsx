"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";

export default function ProductForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    subCategory: "",
    productCollection: "",
    price: "",
    discountPrice: "",
    sku: "",
    stock: "",
    material: "",
    size: "",
    shape: "",
    color: "",
    style: "",
    room: "",
    origin: "",
    weavingType: "",
    pileHeight: "",
    weight: "",
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: false,
    status: "active",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    refundPolicyEnabled: false,
    refundPolicyRefundWindow: 7,
    refundPolicyDescription: "",
    refundPolicyReasonRequired: true,
    refundPolicyShippingResponsibility: "Customer",
    refundPolicyRequiredCondition: "Unused",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price || "",
        discountPrice: initialData.discountPrice || "",
        stock: initialData.stock || "",
        metaKeywords: initialData.metaKeywords?.join(", ") || "",
        refundPolicyEnabled: initialData.refundPolicy?.enabled || false,
        refundPolicyRefundWindow: initialData.refundPolicy?.refundWindow || 0,
        refundPolicyDescription: initialData.refundPolicy?.description || "",
        refundPolicyReasonRequired: initialData.refundPolicy?.reasonRequired ?? true,
        refundPolicyShippingResponsibility: initialData.refundPolicy?.shippingResponsibility || "Customer",
        refundPolicyRequiredCondition: initialData.refundPolicy?.requiredCondition || "Unused",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...newFiles].slice(0, 10)); // max 10 images
    }
  };

  const removeGalleryFile = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("artistic_carpets_admin_token");
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === "boolean") {
          submitData.append(key, formData[key]);
        } else if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      // Handle keywords array
      if (formData.metaKeywords) {
        formData.metaKeywords.split(",").forEach(k => {
          if (k.trim()) submitData.append("metaKeywords[]", k.trim());
        });
      }
      
      // Append files
      if (thumbnailFile) {
        submitData.append("thumbnail", thumbnailFile);
      }
      
      if (galleryFiles.length > 0) {
        galleryFiles.forEach(file => {
          submitData.append("images", file);
        });
      }

      const url = isEditing ? `/admin/api/products/${initialData._id}` : `/admin/api/products`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save product");
      }

      router.push("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link href="/products" style={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </Link>
        <h2 style={styles.title}>{isEditing ? "Edit Product" : "Add New Product"}</h2>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formGrid}>
        
        {/* LEFT COLUMN - Main details */}
        <div style={styles.mainCol}>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Basic Information</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Product Name *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Short Description</label>
              <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} style={{...styles.input, height: "80px"}} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{...styles.input, height: "150px"}} />
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Media (Images)</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Main Thumbnail * (1 image)</label>
              <div style={styles.uploadArea}>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleThumbnailChange}
                  style={styles.fileInput}
                  id="thumbnailUpload"
                />
                <label htmlFor="thumbnailUpload" style={styles.uploadLabel}>
                  <Upload size={24} color="var(--text-muted)" style={{marginBottom: "8px"}} />
                  {thumbnailFile ? (
                    <span style={{color: "var(--primary-brand)", fontWeight: 600}}>{thumbnailFile.name}</span>
                  ) : (
                    <span>Click to upload main product image</span>
                  )}
                </label>
              </div>
              {isEditing && initialData?.thumbnail && !thumbnailFile && (
                <div style={styles.currentImage}>
                  <p style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px"}}>Current Thumbnail:</p>
                  <img src={initialData.thumbnail.path.startsWith("http") ? initialData.thumbnail.path : `http://localhost:5000${initialData.thumbnail.path}`} alt="Current Thumbnail" style={styles.previewImg} />
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Carpet Image (Up to 10 images)</label>
              <div style={styles.uploadArea}>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  multiple
                  onChange={handleGalleryChange}
                  style={styles.fileInput}
                  id="galleryUpload"
                />
                <label htmlFor="galleryUpload" style={styles.uploadLabel}>
                  <Upload size={24} color="var(--text-muted)" style={{marginBottom: "8px"}} />
                  <span>Click to select multiple images</span>
                </label>
              </div>
              
              {galleryFiles.length > 0 && (
                <div style={styles.galleryPreview}>
                  {galleryFiles.map((file, i) => (
                    <div key={i} style={styles.galleryItem}>
                      <span style={{fontSize: "12px", truncate: true}}>{file.name.substring(0, 15)}...</span>
                      <button type="button" onClick={() => removeGalleryFile(i)} style={styles.removeBtn}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {isEditing && initialData?.images?.length > 0 && galleryFiles.length === 0 && (
                <div style={styles.currentImage}>
                  <p style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px"}}>Current Gallery Images:</p>
                  <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                    {initialData.images.map((img, i) => (
                      <img key={i} src={img.path.startsWith("http") ? img.path : `http://localhost:5000${img.path}`} alt="Gallery" style={styles.previewImg} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Pricing & Inventory</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Original Price * (₹)</label>
                <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Discount Price (₹)</label>
                <input type="number" min="0" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>SKU *</label>
                <input required type="text" name="sku" value={formData.sku} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Stock Quantity *</label>
                <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} style={styles.input} />
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Product Specifications</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Material</label>
                <input type="text" name="material" value={formData.material} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Size</label>
                <input type="text" name="size" value={formData.size} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Shape</label>
                <input type="text" name="shape" value={formData.shape} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Origin</label>
                <input type="text" name="origin" value={formData.origin} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Weaving Type</label>
                <input type="text" name="weavingType" value={formData.weavingType} onChange={handleChange} style={styles.input} />
              </div>
            </div>
          </div>
          

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Refund Policy</h3>
            <div style={styles.checkboxGroup}>
              <input type="checkbox" id="refundPolicyEnabled" name="refundPolicyEnabled" checked={formData.refundPolicyEnabled} onChange={handleChange} />
              <label htmlFor="refundPolicyEnabled" style={{ cursor: "pointer" }}>Enable Refunds for this product</label>
            </div>
            {formData.refundPolicyEnabled && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Refund Window (Days)</label>
                  <input type="number" name="refundPolicyRefundWindow" value={formData.refundPolicyRefundWindow} onChange={handleChange} style={styles.input} min="0" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Refund Policy Description</label>
                  <textarea name="refundPolicyDescription" value={formData.refundPolicyDescription} onChange={handleChange} style={{...styles.input, height: "80px"}} />
                </div>
                <div style={styles.checkboxGroup}>
                  <input type="checkbox" id="refundPolicyReasonRequired" name="refundPolicyReasonRequired" checked={formData.refundPolicyReasonRequired} onChange={handleChange} />
                  <label htmlFor="refundPolicyReasonRequired" style={{ cursor: "pointer" }}>Reason Required for Refund</label>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Return Shipping Responsibility</label>
                  <select name="refundPolicyShippingResponsibility" value={formData.refundPolicyShippingResponsibility} onChange={handleChange} style={styles.input}>
                    <option value="Customer">Customer</option>
                    <option value="Seller">Seller</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Required Product Condition</label>
                  <select name="refundPolicyRequiredCondition" value={formData.refundPolicyRequiredCondition} onChange={handleChange} style={styles.input}>
                    <option value="Unused">Unused</option>
                    <option value="Original Packaging">Original Packaging</option>
                    <option value="Damaged Accepted">Damaged Accepted (Optional)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
  
        </div>

        {/* RIGHT COLUMN - Organization & Visibility */}
        <div style={styles.sideCol}>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Publish Status</h3>
            <div style={styles.formGroup}>
              <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
                <option value="active">Active (Published)</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <button type="submit" disabled={isLoading} style={styles.submitBtn}>
              {isLoading ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
              <span>{isEditing ? "Save Changes" : "Publish Product"}</span>
            </button>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Organization</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category *</label>
              <input required type="text" name="category" value={formData.category} onChange={handleChange} style={styles.input} placeholder="e.g. Rugs" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Sub Category</label>
              <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Collection</label>
              <input type="text" name="productCollection" value={formData.productCollection} onChange={handleChange} style={styles.input} placeholder="e.g. Persian Rugs" />
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Visibility & Badges</h3>
            <div style={styles.checkboxGroup}>
              <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
              <label htmlFor="isFeatured" style={{ cursor: "pointer" }}>Featured Product</label>
            </div>
            <div style={styles.checkboxGroup}>
              <input type="checkbox" id="isNewArrival" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} />
              <label htmlFor="isNewArrival" style={{ cursor: "pointer" }}>New Arrival</label>
            </div>
            <div style={styles.checkboxGroup}>
              <input type="checkbox" id="isBestSeller" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} />
              <label htmlFor="isBestSeller" style={{ cursor: "pointer" }}>Best Seller</label>
            </div>
            <div style={styles.checkboxGroup}>
              <input type="checkbox" id="isTrending" name="isTrending" checked={formData.isTrending} onChange={handleChange} />
              <label htmlFor="isTrending" style={{ cursor: "pointer" }}>Trending</label>
            </div>
          </div>

        </div>
      </form>
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}

const styles = {
  container: {
    padding: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "16px",
    transition: "color 0.2s",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
    fontFamily: "var(--font-serif)",
  },
  error: {
    backgroundColor: "var(--color-danger-light)",
    color: "var(--color-danger)",
    padding: "16px",
    borderRadius: "var(--border-radius-sm)",
    marginBottom: "24px",
    fontSize: "14px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
    alignItems: "start",
  },
  mainCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sideCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    position: "sticky",
    top: "24px",
  },
  card: {
    backgroundColor: "var(--bg-primary)",
    borderRadius: "var(--border-radius-md)",
    border: "1px solid var(--border-color)",
    padding: "24px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--border-color)",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-sm)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color 0.2s",
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    fontSize: "14px",
    color: "var(--text-primary)",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "var(--primary-brand)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--border-radius-sm)",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "16px",
    transition: "background-color 0.2s",
  },
  uploadArea: {
    position: "relative",
    border: "2px dashed var(--border-color)",
    borderRadius: "var(--border-radius-sm)",
    padding: "24px",
    textAlign: "center",
    backgroundColor: "var(--bg-secondary)",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  fileInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-secondary)",
    fontSize: "13px",
  },
  galleryPreview: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "12px",
  },
  galleryItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "4px",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--color-danger)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  currentImage: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "4px",
  },
  previewImg: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid var(--border-color)",
  }
};
