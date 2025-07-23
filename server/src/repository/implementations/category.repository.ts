import { ICategoryRepository } from '../interfaces/category.repository';
import CategoryModel, { ICategory } from '../../models/Category';

export class CategoryRepository implements ICategoryRepository {
  async findAll(): Promise<ICategory[]> {
    return await CategoryModel.find().sort({ createdAt: -1 });
  }

  async create(name: string): Promise<ICategory> {
    try {
      const category = new CategoryModel({ name });
      return await category.save();
    } catch (err: any) {
      console.error('Category creation error:', err); // Log the full error
      if (err.code === 11000) {
        // Duplicate key error
        throw new Error('Category name already exists.');
      }
      if (err.name === 'ValidationError') {
        throw new Error('Category name is required.');
      }
      throw err;
    }
  }

  async update(id: string, name: string): Promise<ICategory | null> {
    return await CategoryModel.findByIdAndUpdate(id, { name }, { new: true });
  }

  async delete(id: string): Promise<ICategory | null> {
    return await CategoryModel.findByIdAndDelete(id);
  }
} 