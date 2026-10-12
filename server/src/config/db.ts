import mongoose from 'mongoose';
import { getConfig } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  const { mongoUri } = getConfig();
  await mongoose.connect(mongoUri);
  logger.info('Connected to MongoDB');
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
