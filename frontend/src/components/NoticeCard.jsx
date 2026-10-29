import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { NoticeBadge, ScopeBadge, ExpiryBadge } from './NoticeBadge';

const NoticeCard = ({ notice }) => {
  const { _id, title, description, category, scope, department, author, isImportant, expiresAt, createdAt } = notice;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <article className={`notice-card ${isImportant ? 'is-important' : ''}`} id={`notice-card-${_id}`}>
      <div className="notice-card-header">
        <div className="notice-card-badges">
          <NoticeBadge category={category} />
          <ScopeBadge scope={scope} department={department} />
          {expiresAt && <ExpiryBadge expiresAt={expiresAt} />}
          {isImportant && (
            <span className="important-badge pulse">
              <AlertCircle size={12} />
              IMPORTANT
            </span>
          )}
        </div>
        <div className="notice-date-time" title={new Date(createdAt).toLocaleString()}>
          <Calendar size={13} />
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      <h3 className="notice-card-title">
        <Link to={`/notice/${_id}`}>{title}</Link>
      </h3>

      <p className="notice-card-excerpt">{description}</p>

      <div className="notice-card-footer">
        <div className="notice-author">
          <User size={13} />
          <span>By <strong>{author}</strong></span>
        </div>

        <Link to={`/notice/${_id}`} className="notice-read-link" id={`view-notice-btn-${_id}`}>
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

export default NoticeCard;
