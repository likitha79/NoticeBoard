import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#2563eb', bg = '#eff6ff' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-number">{value}</span>
      </div>
      <div className="stat-icon-wrapper" style={{ backgroundColor: bg, color: color }}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
