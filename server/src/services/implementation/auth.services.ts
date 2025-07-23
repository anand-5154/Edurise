import { IAuthService } from "../interfaces/auth.services"
import { IAuthRepository } from "../../repository/interfaces/auth.interface"
import { IUser } from "../../models/interfaces/auth.interface"
import generateOtp,{otpExpiry} from "../../utils/otpGenerator"
import { sendMail } from "../../utils/sendMail"
import bcrypt from "bcrypt"
import { IOtpRepository } from "../../repository/interfaces/otp.interface"
import { IUserRepository } from "../../repository/interfaces/user.interface";
import { generateOTP } from '../../utils/generateOTP';
import { logger } from '../../utils/logger';
import { hashPassword } from '../../utils/hashPassword';
import jwt from 'jsonwebtoken';
import { messages } from '../../constants/messages';


export class AuthService implements IAuthService{

    constructor(
        private _userRepository: IUserRepository,
        private _otpRepository: IOtpRepository
    ){}

    async registerUser(email: string): Promise<void> {
        try {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error(messages.INVALID_EMAIL_FORMAT);
            }

            // Check if user already exists
            const existingUser = await this._userRepository.findByEmail(email);
            if (existingUser) {
                throw new Error(messages.USER_ALREADY_EXISTS);
            }

            // Generate OTP
            const otp = generateOtp();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Save OTP
            await this._otpRepository.saveOTP({
                email,
                otp,
                expiresAt: otpExpiry
            });

            // Send OTP email
            try {
                await sendMail({
                    to: email,
                    subject: messages.VERIFY_EMAIL_SUBJECT,
                    text: `${messages.YOUR_OTP_IS}: ${otp}. ${messages.IT_WILL_EXPIRE_IN} 10 ${messages.MINUTES}.`
                });
                logger.info('OTP email sent successfully:', { email });
            } catch (emailError: any) {
                logger.error('Failed to send OTP email:', {
                    error: emailError.message,
                    email
                });
                throw new Error(messages.FAILED_TO_SEND_OTP_EMAIL);
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

        const otpRecord = await this._otpRepository.findOtpbyEmail(data.email)
        console.log('Stored OTP:', otpRecord?.otp)

        if(!otpRecord) throw new Error(messages.OTP_NOT_FOUND)

        if(otpRecord.otp!==data.otp) throw new Error(messages.INVALID_OTP)

        const hashedPassword=await bcrypt.hash(data.password,10)

        const user=await this._userRepository.createUser({
            ...data,
            password:hashedPassword
        })

        await this._otpRepository.deleteOtpbyEmail(data.email)

        return user
    }

   async loginUser(credentials: { email: string; password: string }) {
       try {
           // Validate email format
           const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
           if (!emailRegex.test(credentials.email)) {
               throw new Error(messages.INVALID_EMAIL_FORMAT);
           }

           // Find user by email using repository
           const user = await this._userRepository.findByEmail(credentials.email);
           if (!user) {
               throw new Error(messages.INVALID_CREDENTIALS);
           }

           // Check if user is blocked
           if (user.blocked) {
               throw new Error(messages.ACCOUNT_BLOCKED);
           }

           // Verify password
           const isPasswordValid = await user.comparePassword(credentials.password);
           if (!isPasswordValid) {
               throw new Error(messages.INVALID_CREDENTIALS);
           }

           // Generate JWT token
           const accessToken = user.generateAccessToken();
           const refreshToken = user.generateRefreshToken();

           // Save refresh token to user
           await this._userRepository.updateById(user._id.toString(), { refreshToken });

           return {
               user: {
                   id: user._id,
                   name: user.name,
                   email: user.email,
                   role: user.role
               },
               accessToken,
               refreshToken
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
       try {
           const user = await this._userRepository.findByEmail(email);
           if (!user) {
               throw new Error(messages.USER_NOT_FOUND);
           }

           const otp = generateOtp();
           await this._otpRepository.saveOTP({
               email,
               otp,
               expiresAt: new Date(Date.now() + 10 * 60 * 1000)
           });

           await sendMail({
               to: email,
               subject: messages.RESET_PASSWORD_SUBJECT,
               text: `${messages.YOUR_OTP_FOR_PASSWORD_RESET}: ${otp}. ${messages.IT_WILL_EXPIRE_IN} 10 ${messages.MINUTES}.`
           });
       } catch (error: any) {
           logger.error('Forgot password error:', error);
           throw error;
       }
   }

   async verifyForgotOtp(data: { email: string; otp: string }): Promise<boolean> {
       try {
           const otpRecord = await this._otpRepository.findOtpbyEmail(data.email);
           if (!otpRecord || otpRecord.otp !== data.otp) {
               return false;
           }
           return true;
       } catch (error) {
           logger.error('Verify forgot OTP error:', error);
           return false;
       }
   }

   async handleResetPassword(data: { email: string; newPassword: string; confirmPassword: string }): Promise<boolean> {
       try {
           if (data.newPassword !== data.confirmPassword) {
               throw new Error(messages.PASSWORDS_DO_NOT_MATCH);
           }

           const user = await this._userRepository.findByEmail(data.email);
           if (!user) {
               throw new Error(messages.USER_NOT_FOUND);
           }

           const hashedPassword = await hashPassword(data.newPassword);
           await this._userRepository.updateById(user._id.toString(), { password: hashedPassword });

           return true;
       } catch (error: any) {
           logger.error('Reset password error:', error);
           throw error;
       }
   }

   async handleResendOtp(email: string): Promise<void> {
       try {
           const otp = generateOtp();
           await this._otpRepository.saveOTP({
               email,
               otp,
               expiresAt: new Date(Date.now() + 10 * 60 * 1000)
           });

           await sendMail({
               to: email,
               subject: messages.RESEND_OTP_SUBJECT,
               text: `${messages.YOUR_NEW_OTP}: ${otp}. ${messages.IT_WILL_EXPIRE_IN} 10 ${messages.MINUTES}.`
           });
       } catch (error: any) {
           logger.error('Resend OTP error:', error);
           throw error;
       }
   }

   async refreshToken(token: string): Promise<{ accessToken: string }> {
       try {
           const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as { id: string };
           const user = await this._userRepository.findById(decoded.id);
           
           if (!user || user.refreshToken !== token) {
               throw new Error(messages.INVALID_REFRESH_TOKEN);
           }

           const accessToken = user.generateAccessToken();
           return { accessToken };
       } catch (error: any) {
           logger.error('Refresh token error:', error);
           throw new Error(messages.INVALID_REFRESH_TOKEN);
       }
   }

    async handleGoogleAuth(user: any): Promise<{ accessToken: string; refreshToken: string; redirectUrl: string } | null> {
        // user: Google profile object from passport
        if (!user || !user.email) return null;
        // Try to find user by email
        let dbUser = await this._userRepository.findByEmail(user.email);
        if (!dbUser) {
            // Optionally, create a new user if not found
            dbUser = await this._userRepository.createUser({
                name: user.displayName || user.name || user.email,
                email: user.email,
                password: '', // No password for Google users
                role: 'user',
                blocked: false
            });
        }
        // Generate tokens
        const accessToken = dbUser.generateAccessToken();
        const refreshToken = dbUser.generateRefreshToken();
        await this._userRepository.updateById(dbUser._id.toString(), { refreshToken });
        // Redirect URL (frontend)
        const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return { accessToken, refreshToken, redirectUrl };
    }
}