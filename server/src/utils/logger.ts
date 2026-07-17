import fs from 'fs';
import path from 'path';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
  private logDir = path.join(process.cwd(), 'logs');

  constructor() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create log directory:', err);
    }
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  private writeLog(level: LogLevel, message: string, meta?: any) {
    const formatted = this.formatMessage(level, message, meta);
    
    // Console output
    if (level === LogLevel.ERROR) {
      console.error(formatted);
    } else if (level === LogLevel.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    // Write to file
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `${dateStr}.log`);
      fs.appendFileSync(logFile, formatted + '\n', 'utf8');
    } catch (err) {
      // Fallback if append fails
    }
  }

  public debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      this.writeLog(LogLevel.DEBUG, message, meta);
    }
  }

  public info(message: string, meta?: any) {
    this.writeLog(LogLevel.INFO, message, meta);
  }

  public warn(message: string, meta?: any) {
    this.writeLog(LogLevel.WARN, message, meta);
  }

  public error(message: string, error?: any, meta?: any) {
    let errorMeta = meta || {};
    if (error) {
      if (error instanceof Error) {
        errorMeta = { ...errorMeta, message: error.message, stack: error.stack };
      } else {
        errorMeta = { ...errorMeta, error };
      }
    }
    this.writeLog(LogLevel.ERROR, message, errorMeta);
  }
}

export const logger = new Logger();
export default logger;
