import path from "path";
import fs from "fs";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export function createRotatingLogger(filenamePrefix: string) {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new DailyRotateFile({
        dirname: logDir,
        filename: `${filenamePrefix}-%DATE%.log`,
        datePattern: "YYYY-MM-DD", // ← sudah diperbaiki
        zippedArchive: true,
        maxSize: "10m",
        maxFiles: "14d",
      }),
    ],
  });
}
