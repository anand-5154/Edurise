import { IModuleRepository } from '../interfaces/module.repository';
import { IModule } from '../../models/interfaces/IModule-interface';
import Module from '../../models/implementations/moduleModel';
import mongoose from 'mongoose';
import { BaseRepository } from './base.repository';

export class ModuleRepository extends BaseRepository<IModule> implements IModuleRepository {
  constructor() {
    super(Module);
  }

  async createModule(moduleData: Partial<IModule>): Promise<IModule> {
    return Module.create(moduleData);
  }

  async findById(moduleId: string): Promise<IModule | null> {
    return Module.findById(moduleId);
  }

  async findByCourse(courseId: string): Promise<IModule[]> {
    return this.model.find({ course: new mongoose.Types.ObjectId(courseId) }).sort({ order: 1 });
  }

  async updateModule(moduleId: string, update: Partial<IModule>): Promise<IModule | null> {
    return Module.findByIdAndUpdate(moduleId, update, { new: true });
  }

  async deleteModule(moduleId: string): Promise<void> {
    await Module.findByIdAndDelete(moduleId);
  }

  async reorderModules(courseId: string, moduleOrder: string[]): Promise<void> {
    for (let i = 0; i < moduleOrder.length; i++) {
      await this.model.findByIdAndUpdate(moduleOrder[i], { order: i + 1 });
    }
  }
} 