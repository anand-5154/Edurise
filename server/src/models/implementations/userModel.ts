import mongoose,{Schema} from "mongoose"
import {IUser} from "../interfaces/auth.interface"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema:Schema<IUser>=new Schema({
    name:{
        type:String,
        trim:true
    },
    username:{
        type:String,
        required:false,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
    },
    googleId:{
        type:String
    },
    phone:{
        type:String,
        sparse:true,
    },
    role:{
        type:String,
        enum:["user","admin","instructor"],
        default:"user"
    },
    blocked: { type: Boolean, default: false }
},
    {
        timestamps:true
    }
)

// Add methods to the schema
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

userSchema.methods.generateAuthToken = function(): string {
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
    );
};

export default mongoose.model<IUser>("User",userSchema)