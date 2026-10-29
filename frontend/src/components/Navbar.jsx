import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Building2,
  User,
  LayoutDashboard,
  FilePlus,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, isStudent, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header>
      {/* Top Banner with College Affiliation and Live Date */}
      <div className="college-top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-left">
            <span className="top-bar-item">
              <strong>Prasad V. Potluri Siddhartha Institute of Technology (Autonomous)</strong>
            </span>
            <span className="top-bar-item desktop-only">
              • Approved by AICTE, Accredited NAAC 'A+' Grade
            </span>
          </div>
          <div className="top-bar-right">
            <span className="top-bar-item">
              <Calendar size={13} />
              <span>{currentDateStr}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Brand Logo & Name */}
          <Link to="/" className="brand-link" id="brand-home-link">
            <div className="college-logo-badge">
              <Bell size={22} />
            </div>
            <div className="brand-info">
              <span className="brand-title">PVPSIT College</span>
              <span className="brand-subtitle">Digital Notice Board</span>
            </div>
          </Link>

          {/* Navigation Links according to user role */}
          <div className="nav-links">
            {/* ADMIN NAVBAR: PVPSIT College | Dashboard | Notices | Create Notice | Logout */}
            {isAuthenticated && isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-admin-dash"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/notices"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-admin-notices"
                >
                  <Bell size={16} />
                  <span>Notices</span>
                </NavLink>

                <NavLink
                  to="/admin/notices/create"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-admin-create"
                >
                  <FilePlus size={16} />
                  <span>Create Notice</span>
                </NavLink>

                <div className="nav-user-chip" title={`Admin: ${user?.email}`}>
                  <Shield size={13} />
                  <span>Admin</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="nav-link"
                  style={{ color: 'var(--urgent-red)' }}
                  id="nav-logout-btn"
                  title="Sign out of PVPSIT Portal"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            )}

            {/* STUDENT NAVBAR: PVPSIT College | Notices | My Department | Profile | Logout */}
            {isAuthenticated && isStudent && (
              <>
                <NavLink
                  to="/notices"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-student-notices"
                >
                  <Bell size={16} />
                  <span>Notices</span>
                </NavLink>

                <NavLink
                  to="/notices?scope=My+Department"
                  className={`nav-link ${location.search.includes('scope=My+Department') ? 'active' : ''}`}
                  id="nav-student-my-dept"
                >
                  <Building2 size={16} />
                  <span>My Department ({user?.department})</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-student-profile"
                >
                  <User size={16} />
                  <span>Profile</span>
                </NavLink>

                <div className="nav-user-chip" title={`${user?.name} (${user?.studentId || user?.department})`}>
                  <span>{user?.name?.split(' ')[0]}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="nav-link"
                  style={{ color: 'var(--urgent-red)' }}
                  id="nav-logout-btn"
                  title="Sign out"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            )}

            {/* GUEST NAVBAR: PVPSIT College | Notices | Sign In | Create Account */}
            {!isAuthenticated && (
              <>
                <NavLink
                  to="/notices"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-guest-notices"
                >
                  <Bell size={16} />
                  <span>Notices</span>
                </NavLink>

                <Link to="/login" className="nav-link" id="nav-guest-login">
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Link>

                <Link to="/register" className="nav-admin-btn" id="nav-guest-register">
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
