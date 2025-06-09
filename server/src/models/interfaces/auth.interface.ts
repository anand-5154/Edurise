import {Document} from "mongoose"

export interface IUser extends Document{
    name:string,
    username:string,
    email:string,
    password:string,
    googleId:string
    phone:string,
    role:"admin"|"user"|"instructor",
    blocked: boolean,
    createdAt:Date,
    updatedAt:Date
}