"use client";

import React, { useState, useEffect, use } from "react";
import ProductForm from "@/components/products/ProductForm";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function EditProductPage({ params }) {
  // Unwrap params using React.use() as required in Next.js 15+
  const { id } = use(params);
  
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("artistic_carpets_admin_token");
        const res = await fetch(`/admin/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Failed to fetch product data");
        
        const data = await res.json();
        setProductData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '16px', color: 'var(--text-muted)' }}>
        <Loader2 className="spin" size={32} color="var(--primary-brand)" />
        <p>Loading product details...</p>
        <style dangerouslySetInnerHTML={{__html: `
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}} />
      </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
      <div style={{ padding: '32px', color: 'var(--color-danger)' }}>
        <h2>Error loading product</h2>
        <p>{error}</p>
      </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ProductForm initialData={productData} />
    </AdminLayout>
  );
}
