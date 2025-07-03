import User from '../../models/implementations/userModel';

export class UserRepository {
  async findById(id: string) {
    return User.findById(id);
  }

  async updateById(id: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }) {
    return User.findByIdAndUpdate(id, update, { new: true }).select('-password -__v');
  }
} 