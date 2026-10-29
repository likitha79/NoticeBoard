import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  X,
  AlertCircle,
  BellRing,
  Filter,
  Globe,
  Building2,
  Sparkles,
  PhoneCall,
  Flame,
  FileText,
  GraduationCap,
  Briefcase,
  Award,
} from 'lucide-react';
import { fetchNotices, fetchCollegeConfig } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NoticeCard from '../components/NoticeCard';

const DEFAULT_CATEGORIES = [
  'All',
  'Urgent',
  'Examinations',
  'Academics',
  'Circulars',
  'Placements',
  'Workshops & FDPs',
  'Events',
  'Scholarships',
  'Fees',
  'Student Activities',
  'General',
];

const SCOPES = [
  { id: 'All', label: 'All Notices' },
  { id: 'College-wide', label: 'College-wide' },
  { id: 'My Department', label: 'My Department' },
];

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isStudent } = useAuth();

  const [notices, setNotices] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeCategory = searchParams.get('category') || 'All';
  const activeScope = searchParams.get('scope') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const importantOnly = searchParams.get('important') === 'true';

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Fetch dynamic categories from backend config
  useEffect(() => {
    fetchCollegeConfig()
      .then((res) => {
        if (res.success && res.data?.categories) {
          setCategories(['All', 'Urgent', ...res.data.categories.filter((c) => c !== 'Urgent')]);
        }
      })
      .catch((err) => console.log('Using default categories:', err));
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (importantOnly) params.important = 'true';
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (activeScope !== 'All') params.scope = activeScope;

      const res = await fetchNotices(params);
      if (res.success && Array.isArray(res.data)) {
        setNotices(res.data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
      setError('Unable to load circulars. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [activeCategory, activeScope, searchQuery, importantOnly, user]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const urgentNotices = useMemo(() => {
    return notices.filter((n) => n.isImportant || n.category === 'Urgent');
  }, [notices]);

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  const handleScopeChange = (scopeId) => {
    const params = new URLSearchParams(searchParams);
    if (scopeId === 'All') {
      params.delete('scope');
    } else {
      params.set('scope', scopeId);
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    setSearchParams(params);
  };

  const toggleImportantOnly = () => {
    const params = new URLSearchParams(searchParams);
    if (importantOnly) {
      params.delete('important');
    } else {
      params.set('important', 'true');
    }
    setSearchParams(params);
  };

  return (
    <div className="homepage">
      {/* College Hero Section */}
      <section className="hero-banner">
        <div className="container hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>PVPSIT Digital Notice Board</span>
          </div>

          {isAuthenticated && user ? (
            <div style={{ marginBottom: '0.5rem' }}>
              <h1 className="hero-title" style={{ fontSize: '2.1rem' }}>
                Welcome, {user.name}
              </h1>
              <p className="hero-subtitle">
                {isStudent
                  ? `Department of ${user.department} • Roll No: ${user.studentId || 'N/A'}`
                  : 'PVPSIT Administration & Notice Management Portal'}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="hero-title">Academic & Department Circulars</h1>
              <p className="hero-subtitle">
                Official announcements, autonomous semester examination schedules, placement drives, workshops, and departmental notices.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Urgent Announcements Marquee / Ticker */}
      {urgentNotices.length > 0 && (
        <div className="ticker-container">
          <div className="container ticker-wrapper">
            <span className="ticker-label">
              <AlertCircle size={13} />
              IMPORTANT ALERTS
            </span>
            <div className="ticker-content">
              <Link to={`/notice/${urgentNotices[0]._id}`} className="ticker-link">
                <strong>{urgentNotices[0].title}</strong> — {urgentNotices[0].scope === 'Department' ? `Dept: ${urgentNotices[0].department}` : 'College-wide'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="container" style={{ marginTop: '2rem' }}>
        {/* Controls Bar: Scope, Search, Category Filter */}
        <section className="controls-section" aria-label="Notice search and filtering">
          {/* Top Row */}
          <div className="controls-top-row">
            {/* Scope Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {SCOPES.map((sc) => {
                if (sc.id === 'My Department' && !isAuthenticated) {
                  return (
                    <Link
                      key={sc.id}
                      to="/login"
                      className="category-pill"
                      title="Sign in to view your department notices"
                    >
                      <Building2 size={13} />
                      <span>My Department (Sign In)</span>
                    </Link>
                  );
                }

                const isActive = activeScope === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    className={`category-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handleScopeChange(sc.id)}
                    id={`scope-btn-${sc.id.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{ fontWeight: 700 }}
                  >
                    {sc.id === 'College-wide' ? <Globe size={13} /> : sc.id === 'My Department' ? <Building2 size={13} /> : null}
                    <span>{sc.id === 'My Department' && user?.department ? `My Dept (${user.department})` : sc.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search and Important Toggle */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <div className="search-input-box" style={{ minWidth: '220px', maxWidth: '360px' }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by title, department, or keyword..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  id="search-input-field"
                />
                {searchInput && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={clearSearch}
                    title="Clear search"
                    id="search-clear-btn"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`filter-toggle-btn ${importantOnly ? 'active' : ''}`}
                onClick={toggleImportantOnly}
                id="filter-important-toggle-btn"
              >
                <AlertCircle size={15} />
                <span>Important Only</span>
              </button>
            </form>
          </div>

          {/* Category Filter Pills */}
          <div className="category-pills-row" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                  id={`cat-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Notice Feed & Right Sidebar */}
        <div className="notices-layout">
          {/* Main Feed */}
          <div className="notices-feed">
            <div className="notices-section-header">
              <h2 className="section-title">
                <BellRing size={22} color="var(--primary)" />
                <span>
                  {activeScope === 'My Department'
                    ? `${user?.department || 'Department'} Notices`
                    : activeScope === 'College-wide'
                    ? 'College-Wide Notices'
                    : activeCategory !== 'All'
                    ? `${activeCategory} Circulars`
                    : 'Latest Notices'}
                </span>
              </h2>
              <span className="notices-count-badge">
                {notices.length} {notices.length === 1 ? 'Notice' : 'Notices'}
              </span>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading circulars from PVPSIT database...</p>
              </div>
            ) : error ? (
              <div className="alert-box danger">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : notices.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Filter size={32} />
                </div>
                <h3 className="empty-title">
                  {activeScope === 'My Department' ? 'No department notices found.' : 'No notices available.'}
                </h3>
                <p className="empty-desc">
                  {searchQuery
                    ? `No notices matching "${searchQuery}". Try a different keyword or category.`
                    : activeScope === 'My Department'
                    ? `There are currently no notices published for the ${user?.department || ''} department.`
                    : 'There are currently no notices matching the selected criteria.'}
                </p>
                {(searchQuery || activeCategory !== 'All' || activeScope !== 'All' || importantOnly) && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setSearchParams(new URLSearchParams());
                    }}
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem' }}
                    id="reset-filters-btn"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="notices-grid">
                {notices.map((notice) => (
                  <NoticeCard key={notice._id} notice={notice} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="sidebar-widgets">
            {/* Urgent Highlights */}
            <div className="widget-card">
              <div className="widget-header">
                <h3 className="widget-title">
                  <AlertCircle size={18} color="var(--urgent-red)" />
                  <span>Important Notices</span>
                </h3>
              </div>
              {urgentNotices.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No urgent notices at this time.</p>
              ) : (
                <div className="urgent-list">
                  {urgentNotices.slice(0, 4).map((item) => (
                    <Link to={`/notice/${item._id}`} key={item._id} className="urgent-item">
                      <span className="urgent-item-title">{item.title}</span>
                      <div className="urgent-item-meta">
                        <span>{item.scope === 'Department' ? item.department : 'College-wide'}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* PVPSIT Quick Access */}
            <div className="widget-card">
              <div className="widget-header">
                <h3 className="widget-title">
                  <FileText size={18} />
                  <span>Notice Categories</span>
                </h3>
              </div>
              <div className="quick-links-list">
                <button onClick={() => handleCategoryChange('Examinations')} className="quick-link-item" style={{ textAlign: 'left', width: '100%' }}>
                  <span>Autonomous Examinations</span>
                  <GraduationCap size={15} />
                </button>
                <button onClick={() => handleCategoryChange('Placements')} className="quick-link-item" style={{ textAlign: 'left', width: '100%' }}>
                  <span>Training & Placements</span>
                  <Briefcase size={15} />
                </button>
                <button onClick={() => handleCategoryChange('Workshops & FDPs')} className="quick-link-item" style={{ textAlign: 'left', width: '100%' }}>
                  <span>Workshops & FDPs</span>
                  <Flame size={15} />
                </button>
                <button onClick={() => handleCategoryChange('Scholarships')} className="quick-link-item" style={{ textAlign: 'left', width: '100%' }}>
                  <span>JVD & Scholarships</span>
                  <Award size={15} />
                </button>
              </div>
            </div>

            {/* Support Desk */}
            <div className="widget-card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#bfdbfe' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                PVPSIT Student Helpdesk
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                For circular clarifications, examination queries, or fee receipts, contact the Administrative Section.
              </p>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PhoneCall size={14} /> 0866 - 2581699 / 2583037
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
