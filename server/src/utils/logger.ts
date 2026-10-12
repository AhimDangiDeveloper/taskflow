import { getConfig } from '../config/env.js';

type Level = 'info' | 'warn' | 'error';

function write(level: Level, message: string, fields?: Record<string, unknown>) {
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...fields,
  };

  const line = getConfig().isProduction ? JSON.stringify(entry) : formatDevLine(entry);
  if (level === 'error') console.error(line);
  else console.log(line);
}

function formatDevLine(entry: { time: string; level: string; message: string } & Record<string, unknown>) {
  const { time, level, message, ...rest } = entry;
  const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
  return `${time} ${level} ${message}${extra}`;
}

export const logger = {
  info(message: string, fields?: Record<string, unknown>) {
    write('info', message, fields);
  },
  warn(message: string, fields?: Record<string, unknown>) {
    write('warn', message, fields);
  },
  error(message: string, fields?: Record<string, unknown>) {
    write('error', message, fields);
  },
};
