import { ILectureRepository } from '../interfaces/lecture.repository';
import Lecture, { ILecture } from '../../models/implementations/lectureModel';

export class LectureRepository implements ILectureRepository {
  async createLecture(lectureData: Partial<ILecture>): Promise<ILecture> {
    return Lecture.create(lectureData);
  }

  async findById(lectureId: string): Promise<ILecture | null> {
    return Lecture.findById(lectureId);
  }

  async findByModule(moduleId: string): Promise<ILecture[]> {
    return Lecture.find({ module: moduleId }).sort({ order: 1 });
  }

  async updateLecture(lectureId: string, update: Partial<ILecture>): Promise<ILecture | null> {
    return Lecture.findByIdAndUpdate(lectureId, update, { new: true });
  }

  async deleteLecture(lectureId: string): Promise<void> {
    await Lecture.findByIdAndDelete(lectureId);
  }

  async reorderLectures(moduleId: string, lectureOrder: string[]): Promise<void> {
    for (let i = 0; i < lectureOrder.length; i++) {
      await Lecture.findByIdAndUpdate(lectureOrder[i], { order: i + 1 });
    }
  }
} 