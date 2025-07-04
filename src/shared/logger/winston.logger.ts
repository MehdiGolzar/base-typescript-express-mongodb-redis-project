import { Container } from "typedi";
import { createLogger, format, transports, Logger } from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logsDir = path.resolve(__dirname, "../../../logs"); // Points to project root/logs
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Base logger configuration with label
const createBaseLogger = (label: string, level: string) =>
  createLogger({
    level: level,
    format: format.combine(
      format.label({ label }), // Add component label (e.g., [User])
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.errors({ stack: true }),
      format.json() // JSON output for files
    ),
    // defaultMeta: { service: "my-app" },
    transports: [
      new transports.File({
        filename: path.join(logsDir, "error.log"),
        level: "error",
      }),
      new transports.File({
        filename: path.join(logsDir, "info.log"),
        level: "info",
      }),
      new transports.File({
        filename: path.join(logsDir, "combine.log"),
      }),
      new transports.Console({
        format: format.combine(
          format.label({ label }),
          format.colorize(),
          format.printf(({ level, message, label, timestamp }) => {
            return ` ${level}: ${message} ${timestamp} [${label}] `;
          })
        ),
      }),
    ],
  });

// Factory function to get logger for specific components
export function getLogger(component: string): Logger {
  const level = process.env.NODE_ENV === "production" ? "info" : "debug";
  return createBaseLogger(component, level);
}

// Default logger for general use
const defaultLogger = getLogger("App");

// Register default logger in typedi container
Container.set("logger", defaultLogger);

export default defaultLogger;
