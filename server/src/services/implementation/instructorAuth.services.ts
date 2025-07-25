import { IInstructorAuthService } from "../interfaces/instructorAuth.services";
import { IInstructorAuthRepository } from "../../repository/interfaces/instructorAuth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import bcrypt from "bcrypt"
import generateOtp, { otpExpiry } from "../../utils/otpGenerator";
import { IOtpRepository } from "../../repository/interfaces/otp.interface";
import { sendMail } from "../../utils/sendMail";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken";
import jwt from 'jsonwebtoken';
import { messages } from '../../constants/messages';
import Instructor from "../../models/implementations/instructorModel";


export class InstructorAuthSerivce implements IInstructorAuthService{
    constructor(private _instructorAuthRepository:IInstructorAuthRepository,private _otpRepository:IOtpRepository){
    }

    async registerInstructor(email: string): Promise<void> {
        const existing=await this._instructorAuthRepository.findByEmail(email)
        if(existing){
            throw new Error('Instructor already exists');
        }

        const otp=generateOtp()

        await this._otpRepository.saveOTP({
            email:email,
            otp:otp,
            expiresAt:otpExpiry
        })

        try {
        await sendMail(email,otp)
        } catch (err) {
            console.error('Failed to send registration OTP email:', err);
            throw new Error('Failed to send OTP email. Please try again later.');
        }
    }

    async verifyOtp(data: IInstructor & { otp: string; }): Promise<IInstructor> {
        const { email, otp } = data;
        const otpRecord = await this._otpRepository.findOtpbyEmail(email);

        if (!otpRecord) {
            throw new Error(messages.OTP_NOT_FOUND);
        }

        if (otpRecord.otp !== otp) {
            throw new Error(messages.INVALID_OTP);
        }

        // Check if OTP has expired (10 minutes)
        const otpAge = Date.now() - new Date(otpRecord.createdAt).getTime();
        if (otpAge > 10 * 60 * 1000) { // 10 minutes in milliseconds
            await this._otpRepository.deleteOtpbyEmail(email);
            throw new Error(messages.OTP_EXPIRED);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const instructor = await this._instructorAuthRepository.createInstructor({
            ...data,
            password: hashedPassword,
            isVerified: false,
            accountStatus: 'pending'
        });

        await this._otpRepository.deleteOtpbyEmail(email);

        return instructor;
    }

    async loginInstructor(email: string, password: string): Promise<{
        instructor: IInstructor;
        accessToken: string;
        refreshToken: string;
        isVerified: boolean;
        accountStatus: string;
    }> {
        const instructor = await this._instructorAuthRepository.findByEmail(email);
        if (!instructor) {
            throw new Error(messages.INSTRUCTOR_NOT_FOUND);
        }
        if (!instructor.password) {
            throw new Error(messages.ACCOUNT_SETUP_INCOMPLETE);
        }
        // Defensive: check password is a string and looks like a hash
        if (typeof instructor.password !== 'string' || instructor.password.length < 10) {
            throw new Error(messages.ACCOUNT_SETUP_INCOMPLETE);
        }
        const isMatch = await bcrypt.compare(password, instructor.password);
        if (!isMatch) {
            throw new Error(messages.INVALID_CREDENTIALS);
        }
        if (instructor.blocked) {
            throw new Error(messages.ACCOUNT_BLOCKED);
        }
        if (instructor.accountStatus === 'rejected') {
            throw new Error(messages.ACCOUNT_REJECTED);
        }
        // Generate JWT token with role
        const accessToken = generateAccessToken(instructor._id.toString(), 'instructor');
        const refreshToken = generateRefreshToken(instructor._id.toString());
        // Persist the refreshToken using the repository
        await this._instructorAuthRepository.updateRefreshTokenById(instructor._id.toString(), refreshToken);
        instructor.refreshToken = refreshToken;
        return {
            instructor,
            accessToken,
            refreshToken,
            isVerified: instructor.isVerified,
            accountStatus: instructor.accountStatus
        };
    }

    async handleForgotPassword(email: string): Promise<void> {
        const instructor= await this._instructorAuthRepository.findByEmail(email)

        if(!instructor){
        throw new Error(messages.INSTRUCTOR_NOT_FOUND)
        }

        const otp=generateOtp()

        await this._otpRepository.saveOTP({
            email:email,
            otp:otp,
            expiresAt:otpExpiry
        })

        await sendMail(email,otp)
    }

    async verifyForgotOtp(data: { email: string; otp: string }): Promise<boolean> {
        const { email, otp } = data;
        const otpRecord = await this._otpRepository.findOtpbyEmail(email);

        if (!otpRecord) {
            throw new Error(messages.OTP_NOT_FOUND);
        }

        if (otpRecord.otp !== otp) {
            throw new Error(messages.INVALID_OTP);
        }

        if (otpRecord.expiresAt < new Date()) {
            throw new Error(messages.OTP_EXPIRED);
        }

        await this._otpRepository.deleteOtpbyEmail(email);
        return true;
    }

    async handleResetPassword(data: { email: string; newPassword: string; confirmPassword: string; }): Promise<boolean> {
        const { email, newPassword, confirmPassword } = data;

        if (newPassword !== confirmPassword) {
            throw new Error(messages.PASSWORDS_DONT_MATCH);
        }

        const instructor=await this._instructorAuthRepository.findByEmail(email)
        
        if(!instructor){
        throw new Error(messages.USER_NOT_FOUND)
        }

        const hashedPassword=await bcrypt.hash(newPassword,10)

        await this._instructorAuthRepository.updatePassword(email, hashedPassword)

        return true
    }

    async handleResendOtp(email: string): Promise<void> {
        const otp=generateOtp()

        await this._otpRepository.saveOTP({
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

            // Debug logging
            console.log('Decoded instructor ID:', decoded.id);
            console.log('Instructor refreshToken in DB:', instructor?.refreshToken);
            console.log('Provided refreshToken:', token);

            if (!instructor || instructor.refreshToken !== token) {
                throw new Error(messages.INVALID_REFRESH_TOKEN);
            }

            const accessToken = generateAccessToken(instructor._id.toString(), instructor.role);
            return { accessToken };
        } catch (error: any) {
            console.error('Instructor refreshToken error:', error);
            throw new Error(messages.INVALID_REFRESH_TOKEN);
        }
    }
}