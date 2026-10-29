import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Edit2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Save,
  Calendar,
  Clock,
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { fetchNoticeById, updateNotice, fetchCollegeConfig } from '../services/api';

const DEFAULT_CATEGORIES = [
  'General',
  'Academics',
  'Examinations',
  'Circulars',
  'Placements',
  'Events',
  'Workshops & FDPs',
  'Scholarships',
  'Fees',
  'Student Activities',
  'Urgent',
];

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

const EditNoticePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scope: 'College-wide',
    department: 'All',
    category: 'Examinations',
    author: '',
    isImportant: false,
    expiresAt: '',
  });

  const [createdAtDate, setCreatedAtDate] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCollegeConfig()
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.categories) setCategories(res.data.categories);
          if (res.data.departments) setDepartments(res.data.departments);
        }
      })
      .catch(() => console.log('Using default config'));

    const loadNotice = async () => {
      try {
        setInitialLoading(true);
        const res = await fetchNoticeById(id);
        if (res.success && res.data) {
          let formattedExpiry = '';
          if (res.data.expiresAt) {
            formattedExpiry = new Date(res.data.expiresAt).toISOString().split('T')[0];
          }

          setFormData({
            title: res.data.title || '',
            description: res.data.description || '',
            scope: res.data.scope || 'College-wide',
            department: res.data.department || 'All',
            category: res.data.category || 'Examinations',
            author: res.data.author || '',
            isImportant: Boolean(res.data.isImportant),
            expiresAt: formattedExpiry,
          });

          if (res.data.createdAt) {
            setCreatedAtDate(new Date(res.data.createdAt));
          }
        } else {
          setServerError('Notice could not be found.');
        }
      } catch (err) {
        console.error('Failed to load notice for editing:', err);
        setServerError('Failed to load notice details.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadNotice();
  }, [id]);

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Notice title is required';
    } else if (formData.title.length > 180) {
      errs.title = 'Title cannot exceed 180 characters';
    } else if (formData.title.length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Notice description is required';
    } else if (formData.description.length < 5) {
      errs.description = 'Description must be at least 5 characters';
    }

    if (!formData.category) {
      errs.category = 'Category is required';
    }

    if (formData.scope === 'Department' && (!formData.department || formData.department === 'All')) {
      errs.department = 'Please select a specific department';
    }

    if (!formData.author.trim()) {
      errs.author = 'Author name is required';
    }

    if (formData.expiresAt) {
      const selectedExp = new Date(formData.expiresAt);
      if (createdAtDate) {
        const creationDay = new Date(createdAtDate);
        creationDay.setHours(0, 0, 0, 0);
        if (selectedExp < creationDay) {
          errs.expiresAt = 'Expiry date cannot be earlier than the notice creation date';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClearExpiry = () => {
    setFormData((prev) => ({ ...prev, expiresAt: '' }));
    if (errors.expiresAt) {
      setErrors((prev) => ({ ...prev, expiresAt: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        scope: formData.scope,
        department: formData.scope === 'Department' ? formData.department : 'All',
        category: formData.category,
        author: formData.author.trim(),
        isImportant: formData.isImportant,
        expiresAt: formData.expiresAt ? formData.expiresAt : null,
      };

      const res = await updateNotice(id, payload);
      if (res.success) {
        navigate('/admin', {
          state: { flashMessage: `Notice "${formData.title}" updated successfully!` },
        });
      }
    } catch (err) {
      console.error('Failed to update notice:', err);
      setServerError(
        err.response?.data?.message || 'Failed to update notice. Please check all fields.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading circular details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-title-group">
            <Link
              to="/admin"
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginBottom: '0.5rem',
              }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1>Edit Notice</h1>
            <p>Update notice details, scope, department, category, or expiry schedule</p>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert-box danger" style={{ maxWidth: '780px', margin: '0 auto 1.5rem auto' }}>
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-notice-title">
                Notice Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="edit-notice-title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                maxLength={180}
              />
              <div className="form-help-text">
                <span style={{ color: errors.title ? 'var(--urgent-red)' : 'var(--text-muted)' }}>
                  {errors.title || 'Concise title of the announcement'}
                </span>
                <span>{formData.title.length} / 180</span>
              </div>
            </div>

            {/* Scope and Department */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-notice-scope">
                  Notice Type / Scope <span className="required">*</span>
                </label>
                <select
                  id="edit-notice-scope"
                  name="scope"
                  className="form-control"
                  value={formData.scope}
                  onChange={handleChange}
                >
                  <option value="College-wide">College-wide (All Students)</option>
                  <option value="Department">Department Specific</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-notice-department">
                  Department {formData.scope === 'Department' && <span className="required">*</span>}
                </label>
                <select
                  id="edit-notice-department"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={formData.scope === 'College-wide'}
                  style={{ opacity: formData.scope === 'College-wide' ? 0.6 : 1 }}
                >
                  {formData.scope === 'College-wide' ? (
                    <option value="All">All Departments (College-wide)</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))
                  )}
                </select>
                {errors.department && (
                  <div className="form-help-text" style={{ color: 'var(--urgent-red)' }}>
                    {errors.department}
                  </div>
                )}
              </div>
            </div>

            {/* Category and Author */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-notice-category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="edit-notice-category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-notice-author">
                  Author / Issuing Authority <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="edit-notice-author"
                  name="author"
                  className="form-control"
                  value={formData.author}
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.author && (
                  <div className="form-help-text" style={{ color: 'var(--urgent-red)' }}>
                    {errors.author}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-notice-description">
                Notice Content / Description <span className="required">*</span>
              </label>
              <textarea
                id="edit-notice-description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                rows={8}
              ></textarea>
              {errors.description && (
                <div className="form-help-text" style={{ color: 'var(--urgent-red)' }}>
                  {errors.description}
                </div>
              )}
            </div>

            {/* Expiry Date */}
            <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="edit-notice-expires-at" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span>Notice Expiry Date (Optional)</span>
                </label>
                {formData.expiresAt && (
                  <button
                    type="button"
                    onClick={handleClearExpiry}
                    style={{ fontSize: '0.8rem', color: 'var(--urgent-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear Expiry Date
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Set or update the date after which this notice automatically expires. Clear to keep active indefinitely.
              </p>
              <input
                type="date"
                id="edit-notice-expires-at"
                name="expiresAt"
                className="form-control"
                value={formData.expiresAt}
                onChange={handleChange}
                style={{ maxWidth: '280px' }}
              />
              {errors.expiresAt && (
                <div className="form-help-text" style={{ color: 'var(--urgent-red)' }}>
                  {errors.expiresAt}
                </div>
              )}
            </div>

            {/* Important Flag */}
            <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  name="isImportant"
                  checked={formData.isImportant}
                  onChange={handleChange}
                  id="edit-notice-is-important"
                />
                <div>
                  <div>Mark as High Priority / Urgent Notice</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    Urgent notices receive highest visibility and appear in urgent alert tickers.
                  </div>
                </div>
              </label>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/admin" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                id="update-notice-btn"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner spinner-light"></span>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditNoticePage;
