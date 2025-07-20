type LogLevel = 'info' | 'error' | 'warn' | 'debug';

class Logger {
  private _formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log(this._formatMessage('info', message, meta));
  }

  error(message: string, meta?: any): void {
    console.error(this._formatMessage('error', message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this._formatMessage('warn', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this._formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger(); 