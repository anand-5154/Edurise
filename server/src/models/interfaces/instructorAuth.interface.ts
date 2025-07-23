import { Document } from "mongoose";

export interface IInstructor extends Document {
    name: string;
    email: string;
    username: string;
    password: string;
    phone: string;
    title: string;
    education: string[];
    yearsOfExperience: string[];
    role: "user" | "admin" | "instructor";
    accountStatus: "pending" | "approved" | "rejected";
    isVerified: boolean;
    blocked: boolean;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}