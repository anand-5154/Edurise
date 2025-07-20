import { IUser } from "../../models/interfaces/auth.interface";
import { IAuthRepository } from "../interfaces/auth.interface";
import User from "../../models/implementations/userModel";
import { BaseRepository } from "./base.repository";

export class AuthRepository extends BaseRepository<IUser> implements IAuthRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email });
  }
}