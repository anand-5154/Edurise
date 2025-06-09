const express = require('express');
const router = express.Router();
const { 
  adminLogin,
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCourses,
  updateCourseStatus,
  deleteCourse
} = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

// Admin Authentication
router.post('/login', adminLogin);

// Category routes
router.get('/categories', authenticateAdmin, getCategories);
router.post('/categories', authenticateAdmin, createCategory);
router.put('/categories/:id', authenticateAdmin, updateCategory);
router.delete('/categories/:id', authenticateAdmin, deleteCategory);

// Course routes
router.get('/courses', authenticateAdmin, getCourses);
router.put('/courses/:courseId/status', authenticateAdmin, updateCourseStatus);
router.delete('/courses/:courseId', authenticateAdmin, deleteCourse);

module.exports = router; 