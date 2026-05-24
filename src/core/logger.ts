import pino, { type Logger, type LoggerOptions } from 'pino';

export type CoreLogger = Logger;

export const createLogger = (options: LoggerOptions = {}): CoreLogger =>
  pino({
    ...options,
    level: process.env.LOG_LEVEL ?? 'info',
    base: options.base ?? null,
  });

export const logger = createLogger();
