import { Types } from "mongoose";

export interface IComplaint{
    _id:Types.ObjectId|string
    userId:Types.ObjectId|string,
    type:string,
    subject:string,
    message:string,
    targetId?:Types.ObjectId,
    status:string,
    response:string
    createdAt:Date
}