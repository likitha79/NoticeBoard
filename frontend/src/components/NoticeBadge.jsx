import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Briefcase,
  Award,
  Trophy,
  AlertTriangle,
  Info,
  Globe,
  Building2,
  FileText,
  CreditCard,
  Flame,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react';

const categoryIcons = {
  Academics: BookOpen,
  Examinations: GraduationCap,
  Exams: GraduationCap,
  Circulars: FileText,
  Placements: Briefcase,
  Events: Calendar,
  'Workshops & FDPs': Flame,
  Scholarships: Award,
  Fees: CreditCard,
  'Student Activities': Users,
  Sports: Trophy,
  Urgent: AlertTriangle,
  General: Info,
};

const categoryColorMap = {
  Examinations: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  Circulars: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Workshops & FDPs': { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  Fees: { bg: '#fdf4ff', color: '#a21caf', border: '#f5d0fe' },
  'Student Activities': { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  Placements: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  Scholarships: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Academics: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Events: { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' },
  Urgent: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  General: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
};

export const NoticeBadge = ({ category, className = '' }) => {
  const IconComponent = categoryIcons[category] || Info;
  const colors = categoryColorMap[category] || { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontWeight: 700,
        fontSize: '0.75rem',
      }}
    >
      <IconComponent size={13} />
      <span>{category || 'General'}</span>
    </span>
  );
};

export const ScopeBadge = ({ scope, department, className = '' }) => {
  const isDept = scope === 'Department';

  return (
    <span
      className={`badge ${isDept ? 'badge-department' : 'badge-college-wide'} ${className}`}
      style={{
        backgroundColor: isDept ? '#f5f3ff' : '#ecfdf5',
        color: isDept ? '#6d28d9' : '#047857',
        border: `1px solid ${isDept ? '#ddd6fe' : '#a7f3d0'}`,
        fontWeight: 700,
      }}
    >
      {isDept ? <Building2 size={13} /> : <Globe size={13} />}
      <span>{isDept ? `Dept: ${department}` : 'College-wide'}</span>
    </span>
  );
};

export const StatusBadge = ({ expiresAt, className = '' }) => {
  const isExpired = expiresAt && new Date(expiresAt) <= new Date();

  if (isExpired) {
    return (
      <span
        className={`badge ${className}`}
        style={{
          backgroundColor: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
          fontWeight: 700,
          fontSize: '0.72rem',
        }}
      >
        <Clock size={12} />
        <span>Expired</span>
      </span>
    );
  }

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: '#ecfdf5',
        color: '#047857',
        border: '1px solid #a7f3d0',
        fontWeight: 700,
        fontSize: '0.72rem',
      }}
    >
      <CheckCircle size={12} />
      <span>Active</span>
    </span>
  );
};

export const ExpiryBadge = ({ expiresAt, className = '' }) => {
  if (!expiresAt) {
    return null;
  }

  const isExpired = new Date(expiresAt) <= new Date();
  const formatted = new Date(expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: isExpired ? '#fef2f2' : '#f0f9ff',
        color: isExpired ? '#b91c1c' : '#0369a1',
        border: `1px solid ${isExpired ? '#fecaca' : '#bae6fd'}`,
        fontWeight: 600,
        fontSize: '0.72rem',
      }}
      title={`Notice Expiry: ${formatted}`}
    >
      <Clock size={12} />
      <span>{isExpired ? `Expired: ${formatted}` : `Expires: ${formatted}`}</span>
    </span>
  );
};

// Kept for backward compatibility if imported anywhere
export const AttachmentBadge = () => null;

export default NoticeBadge;
