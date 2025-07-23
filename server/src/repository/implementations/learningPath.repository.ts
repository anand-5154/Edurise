import LearningPath, { ILearningPath } from '../../models/implementations/learningPathModel';
import { BaseRepository } from './base.repository';

export class LearningPathRepository extends BaseRepository<ILearningPath> {
  constructor() {
    super(LearningPath);
  }

  async getAllLearningPaths(): Promise<ILearningPath[]> {
    return this.model.find().populate('courses');
  }

  async getLearningPathById(id: string): Promise<ILearningPath | null> {
    return this.model.findById(id).populate('courses');
  }

  async createLearningPath(data: Partial<ILearningPath>): Promise<ILearningPath> {
    return this.model.create(data);
  }

  async updateLearningPath(id: string, data: Partial<ILearningPath>): Promise<ILearningPath | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteLearningPath(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
} 