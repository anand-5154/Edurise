import { IInstructorAuthService } from "../interfaces/instructorAuth.services";
import { IInstructorAuthRepository } from "../../repository/interfaces/instructorAuth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import bcrypt from "bcrypt"
import generateOtp, { otpExpiry } from "../../utils/otpGenerator";
import { IOtpRepository } from "../../repository/interfaces/otp.interface";
import { sendMail } from "../../utils/sendMail";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken";
import jwt from 'jsonwebtoken';
import Instructor from "../../models/implementations/instructorModel";


export class InstructorAuthSerivce implements IInstructorAuthService{
    constructor(private instructorAuthRepository:IInstructorAuthRepository,private otpRepository:IOtpRepository){
    }

    async registerInstructor(email: string): Promise<void> {
        const existing=await this.instructorAuthRepository.findByEmail(email)
        if(existing){
            throw new Error("Instructor already exists")
        }

        const otp=generateOtp()

        await this.otpRepository.saveOTP({
            email:email,
            otp:otp,
            expiresAt:otpExpiry
        })

        await sendMail(email,otp)
    }

    async verifyOtp(data: IInstructor & { otp: string; }): Promise<IInstructor> {
        const { email, otp } = data;
        const otpRecord = await this.otpRepository.findOtpbyEmail(email);

        if (!otpRecord) {
            throw new Error("OTP not found. Please request a new OTP.");
        }

        if (otpRecord.otp !== otp) {
            throw new Error("Invalid OTP. Please check and try again.");
        }

        // Check if OTP has expired (10 minutes)
        const otpAge = Date.now() - new Date(otpRecord.createdAt).getTime();
        if (otpAge > 10 * 60 * 1000) { // 10 minutes in milliseconds
            await this.otpRepository.deleteOtpbyEmail(email);
            throw new Error("OTP has expired. Please request a new OTP.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const instructor = await this.instructorAuthRepository.createInstructor({
            ...data,
            password: hashedPassword,
            isVerified: false,
            accountStatus: 'pending'
        });

        await this.otpRepository.deleteOtpbyEmail(email);

        return instructor;
    }

    async loginInstructor(email: string, password: string): Promise<{
        instructor: IInstructor;
        accessToken: string;
        refreshToken: string;
        isVerified: boolean;
        accountStatus: string;
    }> {
        console.log('Login attempt for email:', email);

        const instructor = await this.instructorAuthRepository.findByEmail(email);
        console.log('Instructor found:', instructor);

        if (!instructor) {
            console.error('No account found with this email:', email);
            throw new Error("No account found with this email. Please check your email or register.");
        }

        if (!instructor.password) {
            console.error('Account setup incomplete for:', email);
            throw new Error("Account setup incomplete. Please contact support.");
        }

        const isMatch = await bcrypt.compare(password, instructor.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.error('Incorrect password for:', email);
            throw new Error("Incorrect password. Please try again.");
        }

        if (instructor.blocked) {
            console.error('Blocked account:', email);
            throw new Error("Your account has been blocked due to policy violations. Please contact support for assistance.");
        }

        if (instructor.accountStatus === 'rejected') {
            console.error('Rejected account:', email);
            throw new Error("Your account has been rejected. Please contact support for more information.");
        }

        // Generate JWT token with role
        const accessToken = generateAccessToken(instructor._id.toString(), 'instructor');
        const refreshToken = generateRefreshToken(instructor._id.toString());

        // Save refresh token
        instructor.refreshToken = refreshToken;
        console.log('Saving refresh token for:', email);
        try {
            await instructor.save();
        } catch (err) {
            console.error('Error saving instructor refresh token:', err);
            throw err;
        }
        console.log('Login successful for:', email);

        return {
            instructor,
            accessToken,
            refreshToken,
            isVerified: instructor.isVerified,
            accountStatus: instructor.accountStatus
        };
    }

    async handleForgotPassword(email: string): Promise<void> {
        const instructor= await this.instructorAuthRepository.findByEmail(email)

        if(!instructor){
        throw new Error("No Instructor found")
        }

        const otp=generateOtp()

        await this.otpRepository.saveOTP({
            email:email,
            otp:otp,
            expiresAt:otpExpiry
        })

        await sendMail(email,otp)
    }

    async verifyForgotOtp(data: { email: string; otp: string }): Promise<boolean> {
        const { email, otp } = data;
        const otpRecord = await this.otpRepository.findOtpbyEmail(email);

        if (!otpRecord) {
            throw new Error("OTP not found");
        }

        if (otpRecord.otp !== otp) {
            throw new Error("Invalid OTP");
        }

        if (otpRecord.expiresAt < new Date()) {
            throw new Error("OTP expired");
        }

        await this.otpRepository.deleteOtpbyEmail(email);
        return true;
    }

    async handleResetPassword(data: { email: string; newPassword: string; confirmPassword: string; }): Promise<boolean> {
        const { email, newPassword, confirmPassword } = data;

        if (newPassword !== confirmPassword) {
            throw new Error("Passwords don't match");
        }

        const instructor=await this.instructorAuthRepository.findByEmail(email)
        
        if(!instructor){
        throw new Error("User not found")
        }

        const hashedPassword=await bcrypt.hash(newPassword,10)

        await this.instructorAuthRepository.updatePassword(email, hashedPassword)

        return true
    }

    async handleResendOtp(email: string): Promise<void> {
        const otp=generateOtp()

        await this.otpRepository.saveOTP({
        email:email,
        otp:otp,
        expiresAt:otpExpiry
        })

        await sendMail(email,otp)
    }

    async refreshToken(token: string): Promise<{ accessToken: string }> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as { id: string };
            const instructor = await Instructor.findById(decoded.id);
    
            if (!instructor || instructor.refreshToken !== token) {
                throw new Error('Invalid refresh token');
            }
    
            const accessToken = generateAccessToken(instructor._id.toString(), instructor.role);
            return { accessToken };
        } catch (error: any) {
            throw new Error('Invalid refresh token');
        }
    }
}