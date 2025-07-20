import { IInstructorController } from "../interfaces/instructorAuth.interface";
import { IInstructorAuthRepository } from "../../repository/interfaces/instructorAuth.interface";
import { IInstructorAuthService } from "../../services/interfaces/instructorAuth.services";
import { Request, Response } from "express";
import { httpStatus } from "../../constants/statusCodes";

export class InstructorAuthController implements IInstructorController{
    constructor(private _instructorAuthService:IInstructorAuthService){
    }

    async signup(req: Request, res: Response): Promise<void> {
        try{
            const {email}=req.body
            await this._instructorAuthService.registerInstructor(email)
            res.status(httpStatus.OK).json({message:"OTP sent Successfully"})
        }catch(err:any){
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
        }
    }

    async signin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                res.status(httpStatus.BAD_REQUEST).json({ 
                    message: "Email and password are required" 
                });
                return;
            }

            const result = await this._instructorAuthService.loginInstructor(email, password);
            res.status(httpStatus.OK).json({ 
                ...result,
                message: "Login successful"
            });
        } catch (err: any) {
            // Handle specific error cases
            if (err.message.includes("No account found")) {
                res.status(httpStatus.NOT_FOUND).json({ message: err.message });
            } else if (err.message.includes("Incorrect password")) {
                res.status(httpStatus.UNAUTHORIZED).json({ message: err.message });
            } else if (err.message.includes("blocked")) {
                res.status(httpStatus.FORBIDDEN).json({ message: err.message });
            } else if (err.message.includes("pending")) {
                res.status(httpStatus.FORBIDDEN).json({ message: err.message });
            } else {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
                    message: "An unexpected error occurred. Please try again later." 
                });
            }
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
      try{
        const instructorData=req.body
        const user=await this._instructorAuthService.verifyOtp(instructorData)
        res.status(httpStatus.CREATED).json({user,message:"Instructor Registered Successfully, Waiting for approval"})
      }catch(err:any){
        console.log(err.message)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try{
        const {email}=req.body
        const user = await this._instructorAuthService.handleForgotPassword(email)

        res.status(httpStatus.OK).json({message:"OTP Sent Successfully"})
      }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async verifyForgotOtp(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            await this._instructorAuthService.verifyForgotOtp(data);
            res.status(httpStatus.OK).json({ message: 'OTP verified.' });
        } catch (err) {
            res.status(httpStatus.NOT_FOUND).json(err);
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try{
        const data=req.body
        await this._instructorAuthService.handleResetPassword(data)
        res.status(httpStatus.OK).json({message:"Password resetted successfully"})
      }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async resentOtp(req: Request, res: Response): Promise<void> {
        try{
        let {email}=req.body
        await this._instructorAuthService.handleResendOtp(email)
        res.status(httpStatus.OK).json({message:"OTP resent Successsfully!"})
      }catch(err:any){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
      }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(httpStatus.BAD_REQUEST).json({ message: 'Refresh token is required' });
                return;
            }
    
            const result = await this._instructorAuthService.refreshToken(refreshToken);
            res.status(httpStatus.OK).json(result);
        } catch (err: any) {
            res.status(httpStatus.UNAUTHORIZED).json({ message: err.message });
        }
    }
}