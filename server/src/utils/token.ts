import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'vinfast_jwt_secret_key_2026_super_secure_32_chars',
    { expiresIn: '15m' } // Short-lived access token
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'vinfast_jwt_refresh_secret_key_2026_super_secure_64_chars',
    { expiresIn: '7d' } // Long-lived refresh token
  );
};
