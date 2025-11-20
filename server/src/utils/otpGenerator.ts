import otpGenerator from "otp-generator"

export default function generateOtp(){
    const otp=otpGenerator.generate(6,{
        digits:true,
        lowerCaseAlphabets:false,
        upperCaseAlphabets:false,
        specialChars:false
    })
    if (process.env.NODE_ENV !== "production") {
        console.log("[OTP]", otp)
    } else {
        console.log("[OTP SENT]", otp)
    }
    return otp
}

export const otpExpiry=new Date(Date.now()+5*60*1000)