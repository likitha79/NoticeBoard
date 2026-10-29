import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  Bell,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-avatar">
          <Shield size={20} />
        </div>
        <div>
          <div className="admin-sidebar-title">{user?.name || 'PVPSIT Admin'}</div>
          <div className="admin-sidebar-role">{user?.email || 'admin@pvpsit.ac.in'}</div>
        </div>
      </div>

      <nav className="admin-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          id="sidebar-dash-link"
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/notices/create"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          id="sidebar-create-notice-link"
        >
          <FilePlus size={18} />
          <span>Create Notice</span>
        </NavLink>

        <Link
          to="/notices"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-nav-item"
          id="sidebar-preview-board-link"
        >
          <ExternalLink size={18} />
          <span>View Student Board</span>
        </Link>
      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={handleLogout} className="admin-logout-btn" id="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
