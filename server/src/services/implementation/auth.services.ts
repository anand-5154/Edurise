import { IAuthService } from "../interfaces/auth.services"
import { IAuthRepository } from "../../repository/interfaces/auth.interface"
import { IUser } from "../../models/interfaces/auth.interface"
import generateOtp,{otpExpiry} from "../../utils/otpGenerator"
import { sendMail } from "../../utils/sendMail"
import bcrypt from "bcrypt"
import { IOtpRepository } from "../../repository/interfaces/otp.interface"
import User from '../../models/implementations/userModel';
import { generateOTP } from '../../utils/generateOTP';
import { logger } from '../../utils/logger';
import { hashPassword } from '../../utils/hashPassword';


export class AuthService implements IAuthService{

    constructor(private userRepository:IAuthRepository,private otpRepository:IOtpRepository){
    }

    async registerUser(email: string): Promise<void> {
        try {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Invalid email format');
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Generate OTP
            const otp = generateOtp();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Save OTP
            await this.otpRepository.saveOTP({
                email,
                otp,
                expiresAt: otpExpiry
            });

            // Send OTP email
            try {
                await sendMail({
                    to: email,
                    subject: 'Verify your email',
                    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`
                });
                logger.info('OTP email sent successfully:', { email });
            } catch (emailError: any) {
                logger.error('Failed to send OTP email:', {
                    error: emailError.message,
                    email
                });
                throw new Error('Failed to send OTP email');
            }
        } catch (error: any) {
            logger.error('Registration service error:', {
                error: error.message,
                email,
                stack: error.stack
            });
            throw error;
        }
    }

    async verifyOtp(data:IUser&{otp:string}): Promise<IUser> {
        console.log('Verifying OTP for email:', data.email)
        console.log('Received OTP:', data.otp)

        const otpRecord = await this.otpRepository.findOtpbyEmail(data.email)
        console.log('Stored OTP:', otpRecord?.otp)

        if(!otpRecord) throw new Error("OTP not found")

        if(otpRecord.otp!==data.otp) throw new Error("Invalid OTP")

        const hashedPassword=await bcrypt.hash(data.password,10)

        const user=await this.userRepository.createUser({
            ...data,
            password:hashedPassword
        })

        await this.otpRepository.deleteOtpbyEmail(data.email)

        return user
    }

   async loginUser(credentials: { email: string; password: string }) {
       try {
           // Validate email format
           const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
           if (!emailRegex.test(credentials.email)) {
               throw new Error('Invalid email format');
           }

           // Find user by email
           const user = await User.findOne({ email: credentials.email });
           if (!user) {
               throw new Error('Invalid credentials');
           }

           // Check if user is blocked
           if (user.blocked) {
               throw new Error('Your account has been blocked. Please contact support.');
           }

           // Verify password
           const isPasswordValid = await user.comparePassword(credentials.password);
           if (!isPasswordValid) {
               throw new Error('Invalid credentials');
           }

           // Generate JWT token
           const token = user.generateAuthToken();

           return {
               user: {
                   id: user._id,
                   name: user.name,
                   email: user.email,
                   role: user.role
               },
               token
           };
       } catch (error: any) {
           logger.error('Login service error:', {
               error: error.message,
               email: credentials.email,
               stack: error.stack
           });
           throw error;
       }
   }

   async handleForgotPassword(email: string): Promise<void> {
       const user = await User.findOne({ email });
       if (!user) {
           throw new Error('User not found');
       }

       const otp = generateOtp();
       const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

       await this.otpRepository.saveOTP({
           email,
           otp,
           expiresAt: otpExpiry
       });

       try {
           await sendMail({
               to: email,
               subject: 'Reset Password OTP',
               text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
           });
       } catch (error: any) {
           logger.error('Failed to send reset password OTP:', {
               error: error.message,
               email
           });
           throw error;
       }
   }

   async verifyForgotOtp(data: {email:string,otp:string}): Promise<boolean> {
       console.log('Verifying forgot password OTP for email:', data.email)
       console.log('Received forgot password OTP:', data.otp)

       const otpRecord = await this.otpRepository.findOtpbyEmail(data.email)
       console.log('Stored forgot password OTP:', otpRecord?.otp)

       if(!otpRecord){
           throw new Error("Couldn't find otp in email")
       }

       if(otpRecord.otp!==data.otp){
           throw new Error("otp doesn't match")
       }

       return true
   }

   async handleResetPassword(data: { email: string; newPassword: string; confirmPassword: string }): Promise<boolean> {
       const user = await User.findOne({ email: data.email });

       if(!user){
           throw new Error("User not found")
       }

       if(data.newPassword!==data.confirmPassword){
           throw new Error("Password didn't match")
       }

       const hashedPassword = await hashPassword(data.newPassword);
       user.password = hashedPassword;
       await user.save();

       return true
   }

   async handleResendOtp(email: string): Promise<void> {
       const user = await User.findOne({ email });
       if (!user) {
           throw new Error('User not found');
       }

       const otp = generateOtp();
       const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

       await this.otpRepository.saveOTP({
           email,
           otp,
           expiresAt: otpExpiry
       });

       try {
           await sendMail({
               to: email,
               subject: 'Resend OTP',
               text: `Your new OTP is: ${otp}. It will expire in 10 minutes.`
           });
       } catch (error: any) {
           logger.error('Failed to resend OTP:', {
               error: error.message,
               email
           });
           throw error;
       }
   }
}