const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edurise';

mongoose.connect(MONGO_URI).then(async () => {
  const Module = require('./server/src/models/implementations/moduleModel').default;
  const modules = await Module.find({});
  let updated = 0;
  for (const m of modules) {
    if (typeof m.course === 'string') {
      await Module.updateOne({ _id: m._id }, { $set: { course: new mongoose.Types.ObjectId(m.course) } });
      updated++;
    }
  }
  console.log('Updated modules:', updated);
  process.exit();
}); 