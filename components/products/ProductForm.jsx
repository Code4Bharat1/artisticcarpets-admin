"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formStyles as styles } from "./form/FormStyles";
import BasicInfo from "./form/BasicInfo";
import MediaUpload from "./form/MediaUpload";
import PricingInventory from "./form/PricingInventory";
import ProductSpecs from "./form/ProductSpecs";
import VisibilityPublish from "./form/VisibilityPublish";

export default function ProductForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: "", description: "", category: "",
    price: "", discountPrice: "", sku: "", stock: "", color: "",
    style: "", room: "", origin: "India", pileHeight: "",
    weight: "", isFeatured: false, isTrending: false, isBestSeller: false,
    isNewArrival: false, status: "active", metaTitle: "", metaDescription: "",
    metaKeywords: "", refundPolicyEnabled: false, refundPolicyRefundWindow: 7,
    refundPolicyDescription: "", refundPolicyReasonRequired: true,
    refundPolicyShippingResponsibility: "Customer", refundPolicyRequiredCondition: "Unused",
    variants: [{ size: "", price: "", discountPrice: "", stock: "" }], hoverImageIndex: 0, existingImages: []
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
        variants: initialData.variants?.length > 0 
          ? initialData.variants 
          : [{ 
              size: initialData.size || "Standard", 
              price: initialData.price || "", 
              discountPrice: initialData.discountPrice || "", 
              stock: initialData.stock || "" 
            }],
        hoverImageIndex: initialData.hoverImageIndex || 0,
        existingImages: (initialData.images || []).filter(img => img.path !== initialData.thumbnail?.path),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files?.[0]) {
      const newThumb = e.target.files[0];
      setThumbnailFile(newThumb);
      setGalleryFiles(prev => prev.filter(f => !(f.name === newThumb.name && f.size === newThumb.size)));
    }
  };
  
  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles(prev => {
        const uniqueNewFiles = newFiles.filter(newFile => 
          !prev.some(prevFile => prevFile.name === newFile.name && prevFile.size === newFile.size) &&
          !(thumbnailFile && thumbnailFile.name === newFile.name && thumbnailFile.size === newFile.size)
        );
        return [...prev, ...uniqueNewFiles].slice(0, 20);
      }); // max 20 images
    }
  };
  const removeGalleryFile = (index) => setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  const removeExistingImage = (index) => setFormData(prev => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    try {
      const token = localStorage.getItem("artistic_carpets_admin_token");
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === "newCategory") return; // handled below
        if (key === "category" && formData.category === "add_new") {
          submitData.append("category", formData.newCategory);
          return;
        }
        if (key === "variants") {
          submitData.append("variants", JSON.stringify(formData.variants));
          return;
        }
        if (key === "existingImages") {
          submitData.append("keptImagePaths", JSON.stringify(formData.existingImages.map(img => img.path)));
          return;
        }
        if (typeof formData[key] === "boolean") submitData.append(key, formData[key]);
        else if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) submitData.append(key, formData[key]);
      });

      if (formData.metaKeywords) {
        formData.metaKeywords.split(",").forEach(k => {
          if (k.trim()) submitData.append("metaKeywords[]", k.trim());
        });
      }
      
      if (thumbnailFile) submitData.append("thumbnail", thumbnailFile);
      if (galleryFiles.length > 0) galleryFiles.forEach(f => submitData.append("images", f));

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const url = isEditing ? `${baseUrl}/products/${initialData._id}` : `${baseUrl}/products`;
      
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData
      });

      if (!res.ok) throw new Error((await res.json()).message || "Failed to save product");
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
        <Link href="/products" style={styles.backBtn}><ArrowLeft size={20} /><span>Back to Products</span></Link>
        <h2 style={styles.title}>{isEditing ? "Edit Product" : "Add New Product"}</h2>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formGrid}>
        <div style={styles.mainCol}>
          <BasicInfo formData={formData} handleChange={handleChange} />
          <MediaUpload 
            isEditing={isEditing} initialData={initialData}
            existingImages={formData.existingImages} removeExistingImage={removeExistingImage}
            thumbnailFile={thumbnailFile} handleThumbnailChange={handleThumbnailChange}
            galleryFiles={galleryFiles} handleGalleryChange={handleGalleryChange} removeGalleryFile={removeGalleryFile}
            hoverImageIndex={formData.hoverImageIndex}
            setHoverImageIndex={(idx) => setFormData(prev => ({ ...prev, hoverImageIndex: idx }))}
          />
          <PricingInventory formData={formData} setFormData={setFormData} handleChange={handleChange} />
          <ProductSpecs formData={formData} handleChange={handleChange} />
        </div>
  
        <div style={styles.sideCol}>
          <VisibilityPublish formData={formData} handleChange={handleChange} isEditing={isEditing} isLoading={isLoading} />
        </div>
      </form>
      
      <style dangerouslySetInnerHTML={{__html: `.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}} />
    </div>
  );
}
