import mongoose, { Schema } from "mongoose"
import { IOtp } from "../interfaces/IOtp-interface";

const otpSchema: Schema<IOtp> = new Schema({
    email: {
        type: String,
        required: true,
        index: true // Add index for faster queries
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // 10 minutes in seconds
    }
})

// Add index for faster queries
otpSchema.index({ email: 1, createdAt: 1 })

export default mongoose.model<IOtp>("Otp", otpSchema)