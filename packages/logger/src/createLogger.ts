import winston from "winston"

const logger = winston.createLogger({
  level: "silly",
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
})

export { logger }
