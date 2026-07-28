"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function OrderStatusChart({ data = [] }) {
  return (
    <div className="card-luxury">
      <div className="card-header-flex">
        <div>
          <h3 className="card-title">Order Status</h3>
          <p className="card-subtitle">Current month distribution</p>
        </div>
      </div>
      
      <div style={{ width: "100%", height: "300px", marginTop: "10px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
