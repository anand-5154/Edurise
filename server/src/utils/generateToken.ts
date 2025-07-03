import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: "10s" });
}

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key', { expiresIn: '7d' });
}
