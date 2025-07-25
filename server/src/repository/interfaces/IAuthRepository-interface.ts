import { IUser } from "../../models/interfaces/IAuth-interface";

export interface IAuthRepository{
    createUser(userData:Partial<IUser>):Promise<IUser>
    findByEmail(email:string):Promise<IUser|null>
}