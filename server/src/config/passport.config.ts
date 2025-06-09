import passport from "passport"
import { Profile, Strategy as GoogleStrategy } from "passport-google-oauth20"
import dotenv from "dotenv"
import User from "../models/implementations/userModel"

dotenv.config()

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:5000/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"));
        }

        let user = await User.findOne({ email });

        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          const newUser = new User({
            name: profile.displayName,
            email,
            googleId: profile.id,
            isVerified: true // Auto-verify Google users
          });

          await newUser.save();
          return done(null, newUser)
        }
      } catch (error) {
        console.error("Google Auth Error:", error);
        return done(error);
      }
    }
  )
);

export default passport