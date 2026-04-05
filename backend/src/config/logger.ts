// backend/src/config/logger.ts
import { config } from "./index";

type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

class Logger {
  private isDev = config.nodeEnv === "development";

  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;

    if (level === "ERROR") {
      console.error(prefix, message, ...args);
    } else if (level === "WARN") {
      console.warn(prefix, message, ...args);
    } else if (level === "DEBUG" && this.isDev) {
      console.log(prefix, message, ...args);
    } else if (level !== "DEBUG") {
      console.log(prefix, message, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    this.log("ERROR", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log("WARN", message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log("INFO", message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log("DEBUG", message, ...args);
  }
}

export const logger = new Logger();
