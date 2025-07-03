import { Document } from "mongoose";

export interface IInstructor extends Document {
    name: string;
    email: string;
    username: string;
    password: string;
    phone: string;
    title: string;
    yearsOfExperience: number;
    role: "user" | "admin" | "instructor";
    education: string;
    accountStatus: "pending" | "approved" | "rejected";
    isVerified: boolean;
    blocked: boolean;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}