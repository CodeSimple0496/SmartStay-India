import React from 'react';
import './MobileDashboardNav.css';

const MobileDashboardNav = ({ links, activeTab, setActiveTab }) => {
  if (!links || links.length === 0) return null;

  return (
    <nav className="mobile-dashboard-nav glass shadow-lg">
      {links.map((link) => (
        <button 
          key={link.id}
          onClick={() => setActiveTab(link.id)} 
          className={`mobile-nav-btn ${activeTab === link.id ? 'active' : ''}`}
        >
          {link.icon}
          <span>{link.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileDashboardNav;
