import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/implementations/courseModel';
import Instructor from '../models/implementations/instructorModel';

dotenv.config();

const sampleCourses = [
  {
    title: 'Introduction to Web Development',
    description: 'Learn the basics of web development including HTML, CSS, and JavaScript.',
    price: 49.99,
    category: 'Web Development',
    level: 'beginner',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80',
    isPublished: true
  },
  {
    title: 'Advanced React Development',
    description: 'Master React with advanced concepts like hooks, context, and performance optimization.',
    price: 79.99,
    category: 'Web Development',
    level: 'advanced',
    duration: 15,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    isPublished: true
  },
  {
    title: 'Data Science Fundamentals',
    description: 'Introduction to data science, statistics, and machine learning concepts.',
    price: 89.99,
    category: 'Data Science',
    level: 'intermediate',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    isPublished: true
  },
  {
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile applications using React Native.',
    price: 69.99,
    category: 'Mobile Development',
    level: 'intermediate',
    duration: 12,
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    isPublished: true
  },
  {
    title: 'UI/UX Design Principles',
    description: 'Learn the fundamentals of user interface and user experience design.',
    price: 59.99,
    category: 'Design',
    level: 'beginner',
    duration: 8,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2064&q=80',
    isPublished: true
  }
];

const seedCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edurise');
    console.log('Connected to MongoDB');

    // Find an instructor to assign courses to
    const instructor = await Instructor.findOne({ role: 'instructor' });
    if (!instructor) {
      console.error('No instructor found in the database');
      process.exit(1);
    }

    // Add instructor ID to courses
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructor: instructor._id
    }));

    // Insert courses
    await Course.insertMany(coursesWithInstructor);
    console.log('Sample courses seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses(); 