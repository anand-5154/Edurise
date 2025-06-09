import { IOtpRepository } from "../interfaces/otp.interface";
import { IOtp } from "../../models/interfaces/otp.interface";
import Otp from "../../models/implementations/otpModel"

export class OtpRepository implements IOtpRepository{
    
    async saveOTP(data: { email: string; otp: string; }): Promise<IOtp|null> {
        console.log('Saving OTP for email:', data.email)
        console.log('OTP to save:', data.otp)
        let saveotp : IOtp|null
        const existing = await Otp.findOne({email:data.email})
        if(existing){
           saveotp= await Otp.findOneAndUpdate({email:data.email},{otp:data.otp,expiresAt:new Date()},{new:true})
           console.log('Updated existing OTP')
        }else{
           saveotp= await Otp.create(data)
           console.log('Created new OTP')
        }
        return saveotp
    }

    async findOtpbyEmail(email: string): Promise<IOtp | null> {
        console.log('Finding OTP for email:', email)
        const otp=await Otp.findOne({email})
        console.log('Found OTP:', otp?.otp)
        return otp
    }

    async deleteOtpbyEmail(email: string): Promise<void> {
        console.log('Deleting OTP for email:', email)
        await Otp.findOneAndDelete({email})
        console.log('OTP deleted successfully')
    }
}