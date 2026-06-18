import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  mockMode: (process.env.MOCK_MODE || 'true') === 'true',
  enableP2P3Stubs: (process.env.ENABLE_P2P3_STUBS || 'true') === 'true',
  databaseUrl: process.env.DATABASE_URL,
};
