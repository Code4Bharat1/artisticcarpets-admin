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
    subCategory: "", productCollection: "", price: "", discountPrice: "",
    sku: "", stock: "", material: "", size: "", shape: "", color: "",
    style: "", room: "", origin: "", weavingType: "", pileHeight: "",
    weight: "", isFeatured: false, isTrending: false, isBestSeller: false,
    isNewArrival: false, status: "active", metaTitle: "", metaDescription: "",
    metaKeywords: "", refundPolicyEnabled: false, refundPolicyRefundWindow: 7,
    refundPolicyDescription: "", refundPolicyReasonRequired: true,
    refundPolicyShippingResponsibility: "Customer", refundPolicyRequiredCondition: "Unused",
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
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleThumbnailChange = (e) => e.target.files?.[0] && setThumbnailFile(e.target.files[0]);
  
  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...newFiles].slice(0, 20)); // max 20 images
    }
  };
  const removeGalleryFile = (index) => setGalleryFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    try {
      const token = localStorage.getItem("artistic_carpets_admin_token");
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
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
            thumbnailFile={thumbnailFile} handleThumbnailChange={handleThumbnailChange}
            galleryFiles={galleryFiles} handleGalleryChange={handleGalleryChange} removeGalleryFile={removeGalleryFile}
          />
          <PricingInventory formData={formData} handleChange={handleChange} />
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
