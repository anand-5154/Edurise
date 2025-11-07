import { IOtpRepository } from "../interfaces/Iotp.interface";
import { IOtp } from "../../models/interfaces/Iotp.interface";
import Otp from "../../models/implementations/otpModel";
import { BaseRepository } from "../base.repository";

export class OtpRepository
  extends BaseRepository<IOtp>
  implements IOtpRepository
{
  constructor() {
    super(Otp);
  }

  async saveOTP(data: {
    email: string;
    otp: string;
    expiresAt?: Date;
  }): Promise<IOtp | null> {
    let saveotp: IOtp | null;
    const existing = await this.model.findOne({ email: data.email });

    if (existing) {
      // Update the otp and reset createdAt so TTL (expires) is counted from now
      saveotp = await this.model.findOneAndUpdate(
        { email: data.email },
        { otp: data.otp, createdAt: new Date() },
        { new: true }
      );
    } else {
      // Create a fresh OTP document; createdAt defaults to now but set explicitly for clarity
      saveotp = await this.model.create({
        email: data.email,
        otp: data.otp,
        createdAt: new Date(),
      } as any);
    }

    return saveotp;
  }

  async findOtpbyEmail(email: string): Promise<IOtp | null> {
    const otp = await this.model.findOne({ email });
    return otp;
  }

  async deleteOtpbyEmail(email: string): Promise<void> {
    await this.model.findOneAndDelete({ email });
  }
}
