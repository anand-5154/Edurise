import { IUser } from "../../models/interfaces/IAuth-interface";

export interface IAuthService{
    registerUser(email:string):Promise<void>
    loginUser(credentials: { email: string; password: string }): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken: string }>;
    verifyOtp(data:IUser&{otp:string}):Promise<IUser>,
    handleForgotPassword(email:string):Promise<void>,
    verifyForgotOtp(data:{email:string,otp:string}):Promise<boolean>,
    handleResetPassword(data:{email:string,newPassword:string,confirmPassword:string}):Promise<boolean>,
    handleResendOtp(email:string):Promise<void>
    refreshToken(token: string): Promise<{ accessToken: string }>;
    handleGoogleAuth(user: any): Promise<{ accessToken: string; refreshToken: string; redirectUrl: string } | null>;
}