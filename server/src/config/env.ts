import type { SignOptions } from 'jsonwebtoken';

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  isTest: boolean;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: SignOptions['expiresIn'];
  clientOrigins: string[];
}

let cached: AppConfig | undefined;

export function loadConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV?.trim() || 'development';
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  const jwtSecret = process.env.JWT_SECRET?.trim() ?? '';
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  const mongoUri = process.env.MONGO_URI?.trim() ?? '';
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  const port = Number(process.env.PORT ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const configuredOrigins = process.env.CLIENT_URL?.split(',').map((value) => value.trim()).filter(Boolean);
  const clientOrigins =
    configuredOrigins && configuredOrigins.length > 0
      ? configuredOrigins
      : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  return {
    nodeEnv,
    isProduction,
    isTest,
    port,
    mongoUri,
    jwtSecret,
    jwtExpiresIn: (process.env.JWT_EXPIRES_IN?.trim() || '7d') as SignOptions['expiresIn'],
    clientOrigins,
  };
}

export function getConfig() {
  cached ??= loadConfig();
  return cached;
}
