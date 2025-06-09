import jwt from "jsonwebtoken";

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: "1d" });
}
