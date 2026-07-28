"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import OrderStatusChart from "@/components/dashboard/OrderStatusChart";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import BestSellingProducts from "@/components/dashboard/BestSellingProducts";
import { apiRequest } from "@/lib/api";
import {
  IndianRupee, ShoppingBag, Clock, Package,
  AlertTriangle, RotateCcw, Frown, RefreshCw
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest.get("analytics/comprehensive");
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || "Failed to load dashboard data");
      }
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <RefreshCw className="animate-spin" size={32} color="var(--primary-brand)" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="badge badge-danger" style={{ padding: "16px", fontSize: "14px" }}>
          {error}
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  return (
    <AdminLayout>
      <div className="dashboard-layout fade-in">

        {/* Section 2: KPI Statistics Cards */}
        <div className="dashboard-row dashboard-row-4">
          <DashboardStatCard
            title="Total Revenue"
            value={formatCurrency(data.kpi.totalRevenue)}
            trend={data.kpi.revenueTrend}
            icon={IndianRupee}
            accentColor="var(--color-success)"
          />
          <DashboardStatCard
            title="Today's Orders"
            value={data.kpi.todayOrders}
            trend={data.kpi.ordersTrend}
            icon={ShoppingBag}
            accentColor="var(--color-info)"
            onClick={() => router.push('/orders')}

          />
          <DashboardStatCard
            title="Pending Orders"
            value={data.kpi.pendingOrders}
            trend={0}
            icon={Clock}
            accentColor="var(--color-warning)"
            onClick={() => router.push('/orders')}
          />
          <DashboardStatCard
            title="Total Products"
            value={data.kpi.totalProducts}
            trend={0}
            icon={Package}
            accentColor="var(--primary-brand)"
            onClick={() => router.push('/products')}

          />
        </div>

        <div className="dashboard-row dashboard-row-4" style={{ marginTop: "-8px" }}>
          <DashboardStatCard
            title="Low Stock Products"
            value={data.kpi.lowStockCount}
            trend={0}
            icon={AlertTriangle}
            accentColor="var(--color-danger)"
          />
          <DashboardStatCard
            title="Returns"
            value={data.kpi.returns}
            trend={0}
            icon={RotateCcw}
            accentColor="var(--color-warning)"
          />
          <DashboardStatCard
            title="Pending Refunds"
            value={data.kpi.pendingRefunds}
            trend={0}
            icon={AlertTriangle}
            accentColor="var(--color-warning)"
            onClick={() => router.push('/refunds')}
          />
          <DashboardStatCard
            title="Support"
            value={data.kpi.complaints}
            trend={0}
            icon={Frown}
            accentColor="var(--color-danger)"
            onClick={() => router.push('/complaints')}
          />
        </div>

        {/* Main Grid: Charts & Tables */}
        <div className="dashboard-grid-main">
          {/* Section 3: Sales Analytics */}
          <SalesChart data={data.salesChart} />

          {/* Section 4: Order Status */}
          <OrderStatusChart data={data.orderStatusChart} />

          {/* Section 5: Recent Orders Table */}
          <RecentOrdersTable orders={data.recentOrders} />

          {/* Section 6: Low Stock Alert Card */}
          <LowStockAlert products={data.lowStockProducts} />

          {/* Section 8: Best Selling Products */}
          <BestSellingProducts products={data.bestSelling} />

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Section 7: Revenue Summary */}
            <div className="card-luxury">
              <h3 className="card-title">Revenue Summary</h3>
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="list-item-luxury">
                  <span style={{ color: "var(--text-secondary)" }}>Today</span>
                  <span style={{ fontWeight: "600" }}>{formatCurrency(data.revenueSummary.today)}</span>
                </div>
                <div className="list-item-luxury">
                  <span style={{ color: "var(--text-secondary)" }}>This Week</span>
                  <span style={{ fontWeight: "600" }}>{formatCurrency(data.revenueSummary.thisWeek)}</span>
                </div>
                <div className="list-item-luxury">
                  <span style={{ color: "var(--text-secondary)" }}>This Month</span>
                  <span style={{ fontWeight: "600" }}>{formatCurrency(data.revenueSummary.thisMonth)}</span>
                </div>
              </div>
            </div>

            {/* Section 9: Inventory Overview */}
            <div className="card-luxury">
              <h3 className="card-title">Inventory Overview</h3>
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>In Stock</span>
                    <span style={{ fontWeight: "600" }}>{data.inventoryOverview.inStockPercent}%</span>
                  </div>
                  <div className="progress-container"><div className="progress-fill" style={{ width: `${data.inventoryOverview.inStockPercent}%`, background: "var(--color-success)" }}></div></div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>Low Stock</span>
                    <span style={{ fontWeight: "600" }}>{data.inventoryOverview.lowStockPercent}%</span>
                  </div>
                  <div className="progress-container"><div className="progress-fill" style={{ width: `${data.inventoryOverview.lowStockPercent}%`, background: "var(--color-warning)" }}></div></div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>Out of Stock</span>
                    <span style={{ fontWeight: "600" }}>{data.inventoryOverview.outOfStockPercent}%</span>
                  </div>
                  <div className="progress-container"><div className="progress-fill" style={{ width: `${data.inventoryOverview.outOfStockPercent}%`, background: "var(--color-danger)" }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
