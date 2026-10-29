const mongoose = require('mongoose');
const { DEPARTMENTS, CATEGORIES } = require('../config/collegeConfig');

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a notice title'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a notice description'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters long'],
    },
    scope: {
      type: String,
      enum: ['College-wide', 'Department'],
      default: 'College-wide',
      required: true,
    },
    department: {
      type: String,
      enum: ['All', ...DEPARTMENTS],
      default: 'All',
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      default: 'General',
    },
    author: {
      type: String,
      required: [true, 'Please provide author name/department'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notice', NoticeSchema);
