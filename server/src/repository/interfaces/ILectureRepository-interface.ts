import { ILecture } from '../../models/interfaces/ILecture-interface';

export interface ILectureRepository {
  createLecture(lectureData: Partial<ILecture>): Promise<ILecture>;
  findById(lectureId: string): Promise<ILecture | null>;
  findByModule(moduleId: string): Promise<ILecture[]>;
  updateLecture(lectureId: string, update: Partial<ILecture>): Promise<ILecture | null>;
  deleteLecture(lectureId: string): Promise<void>;
  reorderLectures(moduleId: string, lectureOrder: string[]): Promise<void>;
} 