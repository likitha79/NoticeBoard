import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FilePlus,
  Bell,
  AlertCircle,
  Globe,
  Building2,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/StatCard';
import { NoticeBadge, ScopeBadge, StatusBadge } from '../components/NoticeBadge';
import Modal from '../components/Modal';
import { fetchNotices, deleteNotice, fetchNoticeStats, fetchCollegeConfig } from '../services/api';

const DEFAULT_DEPARTMENTS = [
  'CSE',
  'CSE (AI & ML)',
  'CSE (Data Science)',
  'IT',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
];

const AdminDashboardPage = () => {
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [scopeFilter, setScopeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Expired'
  const [alert, setAlert] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [noticesRes, statsRes, configRes] = await Promise.all([
        fetchNotices(),
        fetchNoticeStats().catch(() => ({ success: false })),
        fetchCollegeConfig().catch(() => ({ success: false })),
      ]);

      if (noticesRes.success && Array.isArray(noticesRes.data)) {
        setNotices(noticesRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (configRes.success && configRes.data?.departments) {
        setDepartments(configRes.data.departments);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      showAlert('Failed to load notices from server', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const openDeleteConfirmation = (notice) => {
    setNoticeToDelete(notice);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return;

    try {
      setIsDeleting(true);
      const res = await deleteNotice(noticeToDelete._id);
      if (res.success) {
        setNotices((prev) => prev.filter((n) => n._id !== noticeToDelete._id));
        showAlert(`Notice "${noticeToDelete.title}" deleted successfully.`, 'success');
        setDeleteModalOpen(false);
        setNoticeToDelete(null);
        fetchNoticeStats().then((sRes) => {
          if (sRes.success) setStats(sRes.data);
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      showAlert(err.response?.data?.message || 'Failed to delete notice.', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered table rows
  const filteredNotices = useMemo(() => {
    const now = new Date();
    return notices.filter((n) => {
      if (scopeFilter !== 'All' && n.scope !== scopeFilter) {
        return false;
      }
      if (departmentFilter !== 'All' && n.department !== departmentFilter) {
        return false;
      }
      if (statusFilter === 'Active') {
        if (n.expiresAt && new Date(n.expiresAt) <= now) return false;
      } else if (statusFilter === 'Expired') {
        if (!n.expiresAt || new Date(n.expiresAt) > now) return false;
      }

      if (searchFilter.trim() !== '') {
        const query = searchFilter.toLowerCase();
        const matchesTitle = n.title?.toLowerCase().includes(query);
        const matchesAuthor = n.author?.toLowerCase().includes(query);
        const matchesCat = n.category?.toLowerCase().includes(query);
        const matchesDept = n.department?.toLowerCase().includes(query);
        return matchesTitle || matchesAuthor || matchesCat || matchesDept;
      }
      return true;
    });
  }, [notices, scopeFilter, departmentFilter, statusFilter, searchFilter]);

  const totalCount = notices.length;
  const expiredCount = notices.filter((n) => n.expiresAt && new Date(n.expiresAt) <= new Date()).length;
  const activeCount = totalCount - expiredCount;
  const importantCount = notices.filter((n) => n.isImportant).length;

  const formatDate = (dateString) => {
    if (!dateString) return 'Indefinite';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-title-group">
            <h1>PVPSIT Admin Dashboard</h1>
            <p>Publish, categorize, and manage official college and department circulars with notice expiry management</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={loadDashboardData}
              className="btn btn-secondary"
              title="Refresh Data"
              id="admin-refresh-btn"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <Link to="/admin/notices/create" className="btn btn-primary" id="admin-create-notice-btn">
              <FilePlus size={16} />
              <span>Create Notice</span>
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {alert && (
          <div className={`alert-box ${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{alert.message}</span>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Notices"
            value={stats?.totalNotices ?? totalCount}
            icon={Bell}
            color="#1e3a8a"
            bg="#eff6ff"
          />
          <StatCard
            title="Active Notices"
            value={stats?.activeNotices ?? activeCount}
            icon={Globe}
            color="#047857"
            bg="#ecfdf5"
          />
          <StatCard
            title="Expired Notices"
            value={stats?.expiredNotices ?? expiredCount}
            icon={Clock}
            color="#dc2626"
            bg="#fee2e2"
          />
          <StatCard
            title="Important Notices"
            value={stats?.importantNotices ?? importantCount}
            icon={AlertCircle}
            color="#d97706"
            bg="#fffbeb"
          />
        </div>

        {/* Notices Management Table */}
        <div className="admin-table-container">
          <div className="admin-table-toolbar">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              All Notices Directory ({filteredNotices.length})
            </h3>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Status filter */}
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                id="admin-status-filter"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Expired">Expired Only</option>
              </select>

              {/* Scope filter */}
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                id="admin-scope-filter"
              >
                <option value="All">All Types</option>
                <option value="College-wide">College-wide</option>
                <option value="Department">Department Specific</option>
              </select>

              {/* Department filter */}
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                id="admin-department-filter"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Filter table..."
                  className="form-control"
                  style={{ width: '180px', padding: '0.45rem 0.75rem 0.45rem 2rem', fontSize: '0.85rem' }}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  id="admin-table-search"
                />
                <Search
                  size={14}
                  style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading notices...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
              <p className="empty-desc">No notices found matching your filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="notice-table" id="admin-notices-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Department</th>
                    <th>Category</th>
                    <th>Published</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotices.map((notice) => (
                    <tr key={notice._id} id={`admin-notice-row-${notice._id}`}>
                      <td>
                        <div className="table-notice-title">
                          <Link to={`/notice/${notice._id}`} style={{ color: 'var(--text-primary)' }}>
                            {notice.title}
                          </Link>
                          {notice.isImportant && (
                            <span className="important-badge pulse" style={{ marginLeft: '0.4rem', fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                              IMPORTANT
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: notice.scope === 'Department' ? '#6d28d9' : '#047857' }}>
                          {notice.scope}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {notice.scope === 'Department' ? notice.department : 'All (College)'}
                        </span>
                      </td>
                      <td>
                        <NoticeBadge category={notice.category} />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: notice.expiresAt && new Date(notice.expiresAt) <= new Date() ? 'var(--urgent-red)' : 'var(--text-muted)' }}>
                          {formatDate(notice.expiresAt)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge expiresAt={notice.expiresAt} />
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <Link
                            to={`/notice/${notice._id}`}
                            className="action-btn view"
                            title="View Public Notice"
                            id={`view-btn-${notice._id}`}
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            to={`/admin/notices/edit/${notice._id}`}
                            className="action-btn edit"
                            title="Edit Notice"
                            id={`edit-btn-${notice._id}`}
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            onClick={() => openDeleteConfirmation(notice)}
                            className="action-btn delete"
                            title="Delete Notice"
                            id={`delete-btn-${notice._id}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        title="Confirm Notice Deletion"
        message={
          <div>
            <p>Are you sure you want to delete this notice?</p>
            <p style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              "{noticeToDelete?.title}"
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--urgent-red)', marginTop: '0.5rem' }}>
              ⚠️ This notice will be permanently removed from MongoDB and all dashboards.
            </p>
          </div>
        }
        confirmText="Delete Notice"
        confirmBtnClass="btn-danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setNoticeToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
