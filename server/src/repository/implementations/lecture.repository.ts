import { ILectureRepository } from '../interfaces/lecture.repository';
import { ILecture } from '../../models/interfaces/ILecture-interface';
import Lecture from '../../models/implementations/lectureModel';
import { BaseRepository } from './base.repository';

export class LectureRepository extends BaseRepository<ILecture> implements ILectureRepository {
  constructor() {
    super(Lecture);
  }

  async createLecture(lectureData: Partial<ILecture>): Promise<ILecture> {
    return this.model.create(lectureData);
  }

  async findById(lectureId: string): Promise<ILecture | null> {
    return this.model.findById(lectureId);
  }

  async findByModule(moduleId: string): Promise<ILecture[]> {
    return this.model.find({ module: moduleId }).sort({ order: 1 });
  }

  async updateLecture(lectureId: string, update: Partial<ILecture>): Promise<ILecture | null> {
    return this.model.findByIdAndUpdate(lectureId, update, { new: true });
  }

  async deleteLecture(lectureId: string): Promise<void> {
    await this.model.findByIdAndDelete(lectureId);
  }

  async reorderLectures(moduleId: string, lectureOrder: string[]): Promise<void> {
    for (let i = 0; i < lectureOrder.length; i++) {
      await this.model.findByIdAndUpdate(lectureOrder[i], { order: i + 1 });
    }
  }
} 