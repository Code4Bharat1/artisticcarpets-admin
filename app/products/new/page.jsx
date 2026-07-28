"use client";

import ProductForm from "@/components/products/ProductForm";
import AdminLayout from "@/components/AdminLayout";

export default function NewProductPage() {
  return (
    <AdminLayout>
      <ProductForm />
    </AdminLayout>
  );
}
