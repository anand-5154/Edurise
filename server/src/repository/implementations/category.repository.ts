import { ICategoryRepository } from '../interfaces/category.repository';
import { ICategory } from '../../models/interfaces/category.interface';
import { Category as CategoryModel } from '../../models/Category';

export class CategoryRepository implements ICategoryRepository {
  async findAll(): Promise<ICategory[]> {
    return await CategoryModel.find().sort({ createdAt: -1 });
  }

  async create(name: string): Promise<ICategory> {
    const category = new CategoryModel({ name });
    return await category.save();
  }

  async update(id: string, name: string): Promise<ICategory | null> {
    return await CategoryModel.findByIdAndUpdate(id, { name }, { new: true });
  }

  async delete(id: string): Promise<ICategory | null> {
    return await CategoryModel.findByIdAndDelete(id);
  }
} 