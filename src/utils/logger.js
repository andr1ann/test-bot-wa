import pino from 'pino';

// Create logger instance
const logger = pino({
  level: process.env.DEBUG === 'true' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: false,
    },
  },
});

export default logger;
