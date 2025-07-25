import { IOtp } from '../../models/interfaces/IOtp-interface';

export interface IOtpRepository {
    saveOTP(data:{email:string,otp:string,expiresAt:Date}):Promise<IOtp|null>,
    findOtpbyEmail(email:string):Promise<IOtp | null>
    deleteOtpbyEmail(email:string):Promise<void>
}