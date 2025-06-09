import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const Database = async (): Promise<void> => {
  try {
    console.log('MongoDB URI:', process.env.MONGO_CREDS) // Debug log
    if (!process.env.MONGO_CREDS) {
      throw new Error('MONGO_CREDS environment variable is not set')
    }
    await mongoose.connect(process.env.MONGO_CREDS)
    console.log("MongoDB connected")
  } catch (err) {
    console.error('Database connection error:', err)
    process.exit(1)
  }
}

export default Database
