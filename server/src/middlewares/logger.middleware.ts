import morgan, { StreamOptions } from 'morgan';
import logger from '../utils/logger';

// Direct morgan log output to our custom logger utility
const stream: StreamOptions = {
  write: (message) => logger.info(message.trim())
};

// Log all requests in development, or only errors/warning/standard entries in prod
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

export const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
