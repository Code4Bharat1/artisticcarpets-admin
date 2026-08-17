"use client";

import React from "react";
import { Upload, X, Check } from "lucide-react";
import { formStyles as styles } from "./FormStyles";

export default function MediaUpload({
  isEditing,
  initialData,
  thumbnailFile,
  handleThumbnailChange,
  existingImages = [],
  removeExistingImage,
  galleryFiles,
  handleGalleryChange,
  removeGalleryFile,
  hoverImageIndex,
  setHoverImageIndex,
}) {
  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "")}${path}`;
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Media (Images)</h3>
      
      {/* Thumbnail */}
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
            <img src={getImageUrl(initialData.thumbnail.path)} alt="Thumbnail" style={styles.previewImg} />
          </div>
        )}
      </div>

      {/* Gallery */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Carpet Images (Up to 20 images)</label>
        
        {galleryFiles.length > 0 && (
          <div style={styles.galleryPreview} style={{marginBottom: "16px"}}>
            {galleryFiles.map((file, i) => (
              <div 
                key={i} 
                style={{ 
                  ...styles.galleryItem, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  gap: '8px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  padding: '8px',
                  position: 'relative'
                }}
                onClick={() => setHoverImageIndex(i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{fontSize: "12px"}}>{file.name.substring(0, 25)}...</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeGalleryFile(i); }} style={styles.removeBtn}><X size={14} /></button>
                </div>
                {hoverImageIndex === i && (
                  <span style={{ fontSize: '12px', color: '#7B1E1E', fontWeight: '500' }}>Hover Image</span>
                )}
              </div>
            ))}
          </div>
        )}

        {isEditing && existingImages?.length > 0 && (
          <div style={styles.currentImage} style={{marginBottom: "16px"}}>
            <p style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px"}}>Current Gallery Images:</p>
            <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
              {existingImages.map((img, i) => (
                <div 
                  key={i} 
                  style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setHoverImageIndex(i)}
                >
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeExistingImage(i); }} 
                      style={{ ...styles.removeBtn, position: 'absolute', top: '4px', right: '4px', zIndex: 10, padding: '2px', backgroundColor: 'rgba(255,255,255,0.8)' }}
                    >
                      <X size={14} color="#333" />
                    </button>
                    <img 
                      src={getImageUrl(img.path)} 
                      alt="Gallery" 
                      style={{
                        ...styles.previewImg,
                        border: '2px solid transparent',
                        padding: '2px',
                        borderRadius: '8px'
                      }} 
                    />
                  </div>
                  {hoverImageIndex === i && (
                    <span style={{ fontSize: '12px', color: '#7B1E1E', fontWeight: '500' }}>Hover Image</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ position: "relative", display: "inline-block" }}>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp"
            multiple
            onChange={handleGalleryChange}
            style={{ ...styles.fileInput, zIndex: 10 }}
            id="galleryUpload"
          />
          <label htmlFor="galleryUpload" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--border-radius-sm)",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--text-primary)"
          }}>
            <Upload size={16} />
            Add Product Image
          </label>
        </div>
      </div>
    </div>
  );
}
