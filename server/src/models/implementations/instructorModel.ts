import mongoose, { Schema } from "mongoose";
import { IInstructor } from "../interfaces/IInstructorAuth-interface";

const instructorSchema: Schema<IInstructor> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    education: {
        type: [String],
        required: true,
        trim: true
    },
    yearsOfExperience: {
        type: [String],
        required: true,
        trim: true
    },
    documentUrl: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ["user", "instructor", "admin"],
        default: "instructor"
    },
    accountStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        required: false
    },
    refreshToken: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model<IInstructor>("Instructor", instructorSchema);