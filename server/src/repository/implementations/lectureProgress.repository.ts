import LectureProgress, { ILectureProgress } from '../../models/implementations/lectureProgressModel';
import mongoose from 'mongoose';

export class LectureProgressRepository {
  async markCompleted(userId: string, courseId: string, moduleId: string, lectureId: string): Promise<void> {
    await LectureProgress.updateOne(
      {
        user: new mongoose.Types.ObjectId(userId),
        course: new mongoose.Types.ObjectId(courseId),
        module: new mongoose.Types.ObjectId(moduleId),
        lecture: new mongoose.Types.ObjectId(lectureId)
      },
      { $set: { completedAt: new Date() } },
      { upsert: true }
    );
  }

  async findByUserAndModule(userId: string, moduleId: string) {
    return LectureProgress.find({ user: new mongoose.Types.ObjectId(userId), module: new mongoose.Types.ObjectId(moduleId) });
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    return LectureProgress.find({ user: new mongoose.Types.ObjectId(userId), course: new mongoose.Types.ObjectId(courseId) });
  }

  async findByCourseAndUsers(courseId: string, userIds: string[]) {
    return LectureProgress.find({ course: courseId, user: { $in: userIds } });
  }
} 