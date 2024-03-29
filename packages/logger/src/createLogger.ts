import winston from "winston"
import ecsFormat from "@elastic/ecs-winston-format"

const createLogger = () => {
  const logger = winston.createLogger({
    level: "silly",
    format: ecsFormat(),
    transports: [new winston.transports.Console()],
  })

  return logger
}

export default createLogger
