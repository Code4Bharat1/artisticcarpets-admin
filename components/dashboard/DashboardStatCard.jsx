import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function DashboardStatCard({ title, value, icon: Icon, trend, accentColor, onClick }) {
  let trendIcon;
  let trendClass = "trend-neutral";
  if (trend > 0) {
    trendIcon = <TrendingUp size={14} />;
    trendClass = "trend-up";
  } else if (trend < 0) {
    trendIcon = <TrendingDown size={14} />;
    trendClass = "trend-down";
  } else {
    trendIcon = <Minus size={14} />;
  }

  return (
    <div 
      className="card-luxury" 
      style={{ padding: "20px", cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div className="card-header-flex " style={{ marginBottom: "8px" }}>
        <span className="card-subtitle " style={{ fontWeight: 600 }}>{title}</span>
        <div
          className="stat-icon-wrapper"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
            width: "36px",
            height: "36px",
            borderRadius: "8px",
          }}
        >
          {Icon && <Icon size={18} />}
        </div>
      </div>
      
      <div className="stat-value" style={{ margin: "4px 0 8px 0", fontSize: "24px" }}>
        {value}
      </div>
      
      <div className={`stat-trend ${trendClass}`}>
        {trendIcon}
        <span>{Math.abs(trend)}% vs last month</span>
      </div>
    </div>
  );
}
