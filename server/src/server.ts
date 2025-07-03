import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import morgan from "morgan"
import http from "http"
import Database from "./config/db.config"
import passport from "./config/passport.config"
import nocache from "nocache"
import session from "express-session"

import paymentRoutes from './routes/payment.routes';

dotenv.config()

const app = express()

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

app.use(passport.initialize())
app.use(passport.session())

import userRoutes from "./routes/user.routes"
import instructorRoutes from "./routes/instructor.routes"
import adminRoutes from "./routes/admin.routes"

Database()

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

const server = http.createServer(app)

app.use(nocache())
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/users", userRoutes)
app.use("/instructors", instructorRoutes)
app.use("/admin", adminRoutes)

app.use('/api/payment', paymentRoutes);

server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`)
})

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err && err.message ? err.message : err
  });
});