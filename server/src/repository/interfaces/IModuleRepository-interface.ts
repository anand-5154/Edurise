import { IModule } from '../../models/interfaces/IModule-interface';

export interface IModuleRepository {
  createModule(moduleData: Partial<IModule>): Promise<IModule>;
  findById(moduleId: string): Promise<IModule | null>;
  findByCourse(courseId: string): Promise<IModule[]>;
  updateModule(moduleId: string, update: Partial<IModule>): Promise<IModule | null>;
  deleteModule(moduleId: string): Promise<void>;
  reorderModules(courseId: string, moduleOrder: string[]): Promise<void>;
} 