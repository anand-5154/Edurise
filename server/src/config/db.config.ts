import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const Database = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log("MongoDB connected")
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

export default Database
