const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  getNoticeStats,
} = require('../controllers/noticeController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

// Admin Stats
router.get('/stats/summary', protect, adminOnly, getNoticeStats);

// Notices CRUD
router
  .route('/')
  .get(optionalAuth, getNotices)
  .post(protect, adminOnly, createNotice);

router
  .route('/:id')
  .get(optionalAuth, getNoticeById)
  .put(protect, adminOnly, updateNotice)
  .delete(protect, adminOnly, deleteNotice);

module.exports = router;
