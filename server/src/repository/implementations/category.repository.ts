import { ICategoryRepository } from '../interfaces/category.repository';
import CategoryModel, { ICategory } from '../../models/Category';
import { BaseRepository } from './base.repository';

export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async findAll(): Promise<ICategory[]> {
    return this.model.find().sort({ createdAt: -1 });
  }

  async create(name: string): Promise<ICategory> {
    try {
      const category = new this.model({ name });
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
    return this.model.findByIdAndUpdate(id, { name }, { new: true });
  }

  async delete(id: string): Promise<ICategory | null> {
    return this.model.findByIdAndDelete(id);
  }
} 