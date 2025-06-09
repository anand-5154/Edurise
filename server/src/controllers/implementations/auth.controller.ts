import {Request,Response} from "express"
import { IAuthController } from "../interfaces/auth.interfaces"
import { IAuthService } from "../../services/interfaces/auth.services"
import {httpStatus} from "../../constants/statusCodes"
import { generateToken } from "../../utils/generateToken"
import { logger } from "../../utils/logger"

export class Authcontroller implements IAuthController{
    constructor (private authService : IAuthService){
    }

    async signup(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.authService.registerUser(email);
            res.status(httpStatus.OK).json({ message: "OTP sent successfully" });
        } catch (err: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }

   async signin(req: Request, res: Response): Promise<void> {
      try {
        const { email, password } = req.body;
        
        // Validate request body
        if (!email || !password) {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Email and password are required' });
            return;
        }

        const result = await this.authService.loginUser({ email, password });
        res.status(httpStatus.OK).json(result);
      } catch (err: any) {
        logger.error('Login controller error:', {
            error: err.message,
            stack: err.stack
        });

        if (err.message === 'Invalid credentials' || err.message === 'Invalid email format') {
            res.status(httpStatus.UNAUTHORIZED).json({ message: err.message });
        } else if (err.message.includes('blocked')) {
            res.status(httpStatus.FORBIDDEN).json({ message: err.message });
        } else {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred during login' });
        }
      }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
      try{
        const userData=req.body
        console.log(userData)
        const user=await this.authService.verifyOtp(userData)
        res.status(httpStatus.CREATED).json({user,message:"User Registered Successfully"})
      }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async googleAuth(req: Request, res: Response): Promise<void> {
      try {
        if (!req.user) {
          res.status(httpStatus.UNAUTHORIZED).json({ message: "Authentication failed" });
          return;
        }

        const token = generateToken((req.user as any).id);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        // Redirect to frontend with token
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Google auth error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=Authentication failed`);
      }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
      try{
        const {email}=req.body
        const user = await this.authService.handleForgotPassword(email)

        res.status(httpStatus.OK).json({message:"OTP Sent Successfully"})
      }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async verifyForgotOtp(req: Request, res: Response): Promise<void> {
      try{
        const data=req.body
        const userData=await this.authService.verifyForgotOtp(data)
        res.status(httpStatus.OK).json({ message: 'OTP verified.'})
      }catch(err){
        res.status(httpStatus.NOT_FOUND).json(err)
      }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
      try{
        const data=req.body
        await this.authService.handleResetPassword(data)
        res.status(httpStatus.OK).json({message:"Password resetted successfully"})
      }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async resentOtp(req: Request, res: Response): Promise<void> {
      try{
        let {email}=req.body
        await this.authService.handleResendOtp(email)
        res.status(httpStatus.OK).json({message:"OTP resent Successsfully!"})
      }catch(err:any){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
  }
}