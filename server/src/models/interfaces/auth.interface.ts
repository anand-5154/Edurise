import {Document} from "mongoose"

export interface IUser extends Document{
    name:string,
    username:string,
    email:string,
    password:string,
    googleId:string
    phone:string,
    profilePicture?: string,
    role:"admin"|"user"|"instructor",
    blocked: boolean,
    refreshToken?: string,
    createdAt:Date,
    updatedAt:Date,
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}