import {Request,Response} from "express"
import { IAuthController } from "../interfaces/auth.interfaces"
import { IAuthService } from "../../services/interfaces/auth.services"
import {httpStatus} from "../../constants/statusCodes"
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken"
import { logger } from "../../utils/logger"
import { messages } from "../../constants/messages";

export class Authcontroller implements IAuthController{
    constructor (private _authService : IAuthService){
    }

    async signup(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this._authService.registerUser(email);
            res.status(httpStatus.OK).json({ message: messages.OTP_SENT });
        } catch (err: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }

   async signin(req: Request, res: Response): Promise<void> {
      try {
        const { email, password } = req.body;
        
        // Validate request body
        if (!email || !password) {
            res.status(httpStatus.BAD_REQUEST).json({ message: messages.ALL_FIELDS_REQUIRED });
            return;
        }

        const result = await this._authService.loginUser({ email, password });
        res.status(httpStatus.OK).json(result);
      } catch (err: any) {
        logger.error('Login controller error:', {
            error: err.message,
            stack: err.stack
        });

        if (err.message === messages.INVALID_CREDENTIALS || err.message === messages.INVALID_EMAIL_FORMAT) {
            res.status(httpStatus.UNAUTHORIZED).json({ message: err.message });
        } else if (err.message.includes('blocked')) {
            res.status(httpStatus.FORBIDDEN).json({ message: err.message });
        } else {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.INTERNAL_SERVER_ERROR });
        }
      }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
      try{
        const userData=req.body
        const user=await this._authService.verifyOtp(userData)
        res.status(httpStatus.CREATED).json({user,message:messages.USER_REGISTERED})
      }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async googleAuth(req: Request, res: Response): Promise<void> {
        try {
          if (!req.user) {
            res.status(httpStatus.UNAUTHORIZED).json({ message: messages.AUTH_FAILED });
            return;
          }
          const result = await this._authService.handleGoogleAuth(req.user);
          if (!result) {
              res.status(httpStatus.NOT_FOUND).json({ message: messages.USER_NOT_FOUND });
              return;
          }
          const { accessToken, refreshToken, redirectUrl } = result;
          res.redirect(`${redirectUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        } catch (error) {
          console.error('Google auth error:', error);
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          res.redirect(`${frontendUrl}/login?error=${messages.AUTH_FAILED}`);
        }
      }

    async forgotPassword(req: Request, res: Response): Promise<void> {
      try{
        const {email}=req.body
        await this._authService.handleForgotPassword(email)
        res.status(httpStatus.OK).json({message:messages.OTP_SENT})
      }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async verifyForgotOtp(req: Request, res: Response): Promise<void> {
      try{
        const data=req.body
        await this._authService.verifyForgotOtp(data)
        res.status(httpStatus.OK).json({ message: messages.OTP_VERIFIED})
      }catch(err){
        res.status(httpStatus.NOT_FOUND).json(err)
      }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
      try{
        const data=req.body
        await this._authService.handleResetPassword(data)
        res.status(httpStatus.OK).json({message:messages.PASSWORD_RESET})
      }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async resentOtp(req: Request, res: Response): Promise<void> {
      try{
        let {email}=req.body
        await this._authService.handleResendOtp(email)
        res.status(httpStatus.OK).json({message:messages.OTP_RESENT})
      }catch(err:any){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(httpStatus.BAD_REQUEST).json({ message: messages.TOKEN_REQUIRED });
                return;
            }
            const result = await this._authService.refreshToken(refreshToken);
            res.status(httpStatus.OK).json(result);
        } catch (err: any) {
            res.status(httpStatus.UNAUTHORIZED).json({ message: err.message });
        }
    }
}