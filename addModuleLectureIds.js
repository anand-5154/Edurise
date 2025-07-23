const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edurise';

mongoose.connect(MONGO_URI).then(async () => {
  const Course = require('./server/src/models/implementations/courseModel').default;
  const courses = await Course.find({});
  let updatedCourses = 0;
  for (const course of courses) {
    let modified = false;
    // Add _id to modules
    if (Array.isArray(course.modules)) {
      course.modules.forEach(module => {
        if (!module._id) {
          module._id = new ObjectId();
          modified = true;
        }
        // Add _id to lectures
        if (Array.isArray(module.lectures)) {
          module.lectures.forEach(lecture => {
            if (!lecture._id) {
              lecture._id = new ObjectId();
              modified = true;
            }
          });
        }
      });
    }
    if (modified) {
      await course.save();
      updatedCourses++;
    }
  }
  console.log('Updated courses:', updatedCourses);
  process.exit();
}); 