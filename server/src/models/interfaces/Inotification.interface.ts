import { Types } from "mongoose";

export interface INotification{
    _id:Types.ObjectId
    receiverId:Types.ObjectId,
    receiverModel:string,
    message:string,
    isRead:boolean
}