import { ICategory } from '../../models/Category';

export interface ICategoryRepository {
  findAll(): Promise<ICategory[]>;
  create(name: string): Promise<ICategory>;
  update(id: string, name: string): Promise<ICategory | null>;
  delete(id: string): Promise<ICategory | null>;
} 