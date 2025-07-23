import mongoose from 'mongoose';
import Module from './server/src/models/implementations/moduleModel';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edurise';

mongoose.connect(MONGO_URI).then(async () => {
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