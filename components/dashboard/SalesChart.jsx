"use client";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({ data = [] }) {
  return (
    <div className="card-luxury" style={{ gridColumn: "span 2" }}>
      <div className="card-header-flex">
        <div>
          <h3 className="card-title">Sales Analytics</h3>
          <p className="card-subtitle">Revenue and order volume over time</p>
        </div>
        <select className="form-select" style={{ width: "130px", padding: "6px 12px" }}>
          <option>This Year</option>
          <option>Last 6 Months</option>
          <option>This Month</option>
        </select>
      </div>
      
      <div style={{ width: "100%", height: "300px", marginTop: "20px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary-brand)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary-brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="var(--primary-brand)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
