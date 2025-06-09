import { IInstructorAuthService } from "../interfaces/instructorAuth.services";
import { IInstructorAuthRepository } from "../../repository/interfaces/instructorAuth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import bcrypt from "bcrypt"
import generateOtp, { otpExpiry } from "../../utils/otpGenerator";
import { IOtpRepository } from "../../repository/interfaces/otp.interface";
import { sendMail } from "../../utils/sendMail";
import { generateToken } from "../../utils/generateToken";


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
            throw new Error("OTP not found");
        }

        if (otpRecord.otp !== otp) {
            throw new Error("Invalid OTP");
        }

        if (otpRecord.expiresAt < new Date()) {
            throw new Error("OTP expired");
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
        token: string;
        isVerified: boolean;
        accountStatus: string;
    }> {
        const instructor = await this.instructorAuthRepository.findByEmail(email);

        if (!instructor) {
            throw new Error("Instructor not registered");
        }

        if (!instructor.password) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, instructor.password);

        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        // Generate JWT token with role
        const token = generateToken(instructor._id.toString(), 'instructor');

        return {
            instructor,
            token,
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
}