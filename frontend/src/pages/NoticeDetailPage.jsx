import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Printer,
  Share2,
  Check,
  Edit,
  Building2,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { fetchNoticeById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NoticeBadge, ScopeBadge, StatusBadge, ExpiryBadge } from '../components/NoticeBadge';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getNotice = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchNoticeById(id);
        if (res.success && res.data) {
          setNotice(res.data);
        } else {
          setError('Notice could not be found.');
        }
      } catch (err) {
        console.error('Error fetching notice:', err);
        setError(err.response?.data?.message || 'Notice could not be found.');
      } finally {
        setLoading(false);
      }
    };

    getNotice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container detail-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading circular details...</p>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="container detail-container">
        <button onClick={() => navigate(-1)} className="back-btn" id="notice-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Notices</span>
        </button>
        <div className="empty-state">
          <div className="empty-icon">
            <AlertCircle size={32} color="var(--urgent-red)" />
          </div>
          <h3 className="empty-title">Notice could not be found.</h3>
          <p className="empty-desc">{error || 'The requested circular does not exist or has expired.'}</p>
          <Link to="/notices" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Go to PVPSIT Notice Board
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = notice.expiresAt && new Date(notice.expiresAt) <= new Date();

  return (
    <div className="detail-container">
      {/* Back navigation */}
      <button onClick={() => navigate(-1)} className="back-btn" id="notice-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Notices</span>
      </button>

      {/* Admin Notice Expired Warning */}
      {isExpired && (
        <div className="alert-box danger" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} />
          <span>
            <strong>Notice Expired:</strong> This circular expired on {formatDate(notice.expiresAt)} and is automatically hidden from students.
          </span>
        </div>
      )}

      <article className={`notice-detail-card ${notice.isImportant ? 'is-important' : ''}`} id="printable-notice">
        {/* Top Badges */}
        <div className="detail-top-badges">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <NoticeBadge category={notice.category} />
            <ScopeBadge scope={notice.scope} department={notice.department} />
            <StatusBadge expiresAt={notice.expiresAt} />
            {notice.expiresAt && <ExpiryBadge expiresAt={notice.expiresAt} />}
            {notice.isImportant && (
              <span className="important-badge pulse">
                <AlertCircle size={13} />
                IMPORTANT
              </span>
            )}
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            Ref: PVPSIT-{notice._id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h1 className="detail-title">{notice.title}</h1>

        {/* Metadata Grid */}
        <div className="detail-meta-grid">
          <div className="meta-box">
            <span className="meta-box-label">Published By</span>
            <span className="meta-box-value">
              <User size={15} color="var(--primary)" />
              {notice.author}
            </span>
          </div>

          <div className="meta-box">
            <span className="meta-box-label">Scope / Audience</span>
            <span className="meta-box-value">
              {notice.scope === 'Department' ? <Building2 size={15} color="#6d28d9" /> : <Globe size={15} color="#047857" />}
              {notice.scope === 'Department' ? `${notice.department} Dept Only` : 'College-wide (All Students)'}
            </span>
          </div>

          <div className="meta-box">
            <span className="meta-box-label">Date Published</span>
            <span className="meta-box-value">
              <Calendar size={15} color="var(--primary)" />
              {formatDate(notice.createdAt)}
            </span>
          </div>

          <div className="meta-box">
            <span className="meta-box-label">Notice Expiry</span>
            <span className="meta-box-value" style={{ color: isExpired ? 'var(--urgent-red)' : 'inherit' }}>
              <Clock size={15} color={isExpired ? 'var(--urgent-red)' : 'var(--primary)'} />
              {notice.expiresAt ? formatDate(notice.expiresAt) : 'No Expiry (Always Active)'}
            </span>
          </div>
        </div>

        {/* Full Notice Content */}
        <div className="detail-body">
          {notice.description}
        </div>

        {/* Action Buttons */}
        <div className="detail-actions-bar">
          <div className="action-btn-group">
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              id="print-notice-btn"
              title="Print official circular copy"
            >
              <Printer size={16} />
              <span>Print Notice</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="btn btn-secondary"
              id="share-notice-btn"
              title="Copy direct circular link"
            >
              {copied ? <Check size={16} color="var(--placement-emerald)" /> : <Share2 size={16} />}
              <span>{copied ? 'Link Copied!' : 'Share Notice'}</span>
            </button>
          </div>

          {isAdmin && (
            <Link
              to={`/admin/notices/edit/${notice._id}`}
              className="btn btn-primary"
              id="edit-notice-direct-btn"
            >
              <Edit size={16} />
              <span>Edit Notice</span>
            </Link>
          )}
        </div>
      </article>
    </div>
  );
};

export default NoticeDetailPage;
