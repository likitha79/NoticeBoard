const Notice = require('../models/Notice');

// Helper to check if a notice is expired
const isNoticeExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) <= new Date();
};

// @desc    Get all notices with role-based visibility, filters, and expiry exclusion
// @route   GET /api/notices
// @access  Public / Authenticated
const getNotices = async (req, res, next) => {
  try {
    const { scope, department, category, search, important, status } = req.query;
    const user = req.user;
    const now = new Date();

    const andConditions = [];

    // 1. Role-aware Visibility & Scope Logic
    if (user && user.role === 'student') {
      const studentDept = user.department;
      if (scope === 'My Department') {
        andConditions.push({ scope: 'Department', department: studentDept });
      } else if (scope === 'College-wide') {
        andConditions.push({ scope: 'College-wide' });
      } else {
        // 'All' view for student: College-wide notices + Student's Department notices
        andConditions.push({
          $or: [
            { scope: 'College-wide' },
            { scope: 'Department', department: studentDept },
          ],
        });
      }

      // Students MUST NEVER see expired notices
      andConditions.push({
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } },
        ],
      });
    } else if (user && user.role === 'admin') {
      // Admins have global access and can view all notices including expired ones
      if (scope && scope !== 'All') {
        andConditions.push({ scope });
      }
      if (department && department !== 'All') {
        andConditions.push({ department });
      }

      // Admin optional status filter: 'active' | 'expired' | 'all'
      if (status === 'active') {
        andConditions.push({
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: now } },
          ],
        });
      } else if (status === 'expired') {
        andConditions.push({
          expiresAt: { $ne: null, $lte: now },
        });
      }
    } else {
      // Guest / Unauthenticated users - only see active notices
      if (scope === 'Department' && department) {
        andConditions.push({ scope: 'Department', department });
      } else if (scope === 'College-wide') {
        andConditions.push({ scope: 'College-wide' });
      }

      // Guests MUST NEVER see expired notices
      andConditions.push({
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } },
        ],
      });
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      andConditions.push({ category });
    }

    // 3. Important Filter
    if (important === 'true') {
      andConditions.push({ isImportant: true });
    }

    // 4. Keyword Search (title, description, author, department, category)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      andConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { author: searchRegex },
          { department: searchRegex },
          { category: searchRegex },
        ],
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};
    const notices = await Notice.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Public / Authenticated
const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice could not be found.',
      });
    }

    // If notice is expired and requester is NOT an admin, do not display
    const user = req.user;
    const isAdmin = user && user.role === 'admin';
    if (!isAdmin && isNoticeExpired(notice.expiresAt)) {
      return res.status(404).json({
        success: false,
        message: 'Notice has expired or is no longer available.',
      });
    }

    return res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new notice (Admin only)
// @route   POST /api/notices
// @access  Private (Admin)
const createNotice = async (req, res, next) => {
  try {
    const { title, description, scope, department, category, author, isImportant, expiresAt } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Notice title is required',
      });
    }

    if (title.trim().length > 180) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 180 characters',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Notice description is required',
      });
    }

    const noticeScope = scope === 'Department' ? 'Department' : 'College-wide';
    let noticeDept = 'All';

    if (noticeScope === 'Department') {
      if (!department || department === 'All') {
        return res.status(400).json({
          success: false,
          message: 'Please select a specific department for department notices',
        });
      }
      noticeDept = department;
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      });
    }

    const noticeAuthor = (author && author.trim()) || req.user?.name || 'PVPSIT Administration';

    // Expiry Date Validation
    let parsedExpiry = null;
    if (expiresAt && expiresAt.toString().trim() !== '' && expiresAt !== 'null') {
      const expDate = new Date(expiresAt);
      if (isNaN(expDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry date format',
        });
      }

      // Check if expiry date is earlier than creation date (today)
      // Allow end of day or compare timestamps with reasonable tolerance
      const creationDate = new Date();
      // If the provided expiry date is in the past
      if (expDate <= new Date(creationDate.getTime() - 60 * 1000)) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date cannot be earlier than the notice creation date',
        });
      }
      parsedExpiry = expDate;
    }

    const notice = await Notice.create({
      title: title.trim(),
      description: description.trim(),
      scope: noticeScope,
      department: noticeDept,
      category,
      author: noticeAuthor,
      isImportant: isImportant === true || isImportant === 'true',
      expiresAt: parsedExpiry,
    });

    return res.status(201).json({
      success: true,
      message: 'Notice published successfully!',
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing notice (Admin only)
// @route   PUT /api/notices/:id
// @access  Private (Admin)
const updateNotice = async (req, res, next) => {
  try {
    const { title, description, scope, department, category, author, isImportant, expiresAt } = req.body;

    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice could not be found.',
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      if (title.length > 180) {
        return res.status(400).json({ success: false, message: 'Title cannot exceed 180 characters' });
      }
      notice.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({ success: false, message: 'Description cannot be empty' });
      }
      notice.description = description.trim();
    }

    if (scope !== undefined) {
      notice.scope = scope === 'Department' ? 'Department' : 'College-wide';
      if (notice.scope === 'College-wide') {
        notice.department = 'All';
      }
    }

    if (department !== undefined && notice.scope === 'Department') {
      if (!department || department === 'All') {
        return res.status(400).json({
          success: false,
          message: 'Please select a specific department for department notices',
        });
      }
      notice.department = department;
    }

    if (category !== undefined) {
      notice.category = category;
    }

    if (author !== undefined && author.trim()) {
      notice.author = author.trim();
    }

    if (isImportant !== undefined) {
      notice.isImportant = isImportant === true || isImportant === 'true';
    }

    // Expiry Date update & validation
    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === '' || expiresAt === 'null') {
        notice.expiresAt = null;
      } else {
        const expDate = new Date(expiresAt);
        if (isNaN(expDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid expiry date format',
          });
        }

        const creationDate = notice.createdAt ? new Date(notice.createdAt) : new Date();
        // Check if expiry date is earlier than notice's publishing/creation date
        if (expDate < new Date(creationDate.getTime() - 60 * 1000)) {
          return res.status(400).json({
            success: false,
            message: 'Expiry date cannot be earlier than the notice creation date',
          });
        }

        notice.expiresAt = expDate;
      }
    }

    const updatedNotice = await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice updated successfully!',
      data: updatedNotice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notice (Admin only)
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice could not be found.',
      });
    }

    await notice.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard metrics
// @route   GET /api/notices/stats/summary
// @access  Private (Admin)
const getNoticeStats = async (req, res, next) => {
  try {
    const now = new Date();
    const totalNotices = await Notice.countDocuments();
    const collegeWideNotices = await Notice.countDocuments({ scope: 'College-wide' });
    const departmentNotices = await Notice.countDocuments({ scope: 'Department' });
    const importantNotices = await Notice.countDocuments({ isImportant: true });
    const expiredNotices = await Notice.countDocuments({ expiresAt: { $ne: null, $lte: now } });
    const activeNotices = totalNotices - expiredNotices;

    return res.status(200).json({
      success: true,
      data: {
        totalNotices,
        activeNotices,
        expiredNotices,
        collegeWideNotices,
        departmentNotices,
        importantNotices,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  getNoticeStats,
};
