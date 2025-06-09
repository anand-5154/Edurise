const User = require('../models/User');
const Course = require('../models/Course');
const Category = require('../models/Category');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Authentication
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'admin' });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Category Management
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Course Management
const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', category = '', level = '', status = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (level) query.level = level;
    if (status) query.isPublished = status === 'published';

    const courses = await Course.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('instructor', 'name');

    const total = await Course.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      courses,
      total,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

const updateCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { isPublished: status === 'published' },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course status', error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndDelete(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

module.exports = {
  adminLogin,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCourses,
  updateCourseStatus,
  deleteCourse
}; 