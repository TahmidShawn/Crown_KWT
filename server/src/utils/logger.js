import pino from "pino";

const logger = pino({
    level:
        process.env.LOG_LEVEL ||
        (process.env.NODE_ENV === "production" ? "info" : "debug"),
    transport:
        process.env.NODE_ENV !== "production"
            ? {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                      translateTime: "HH:MM:ss",
                      ignore: "pid,hostname",
                      singleLine: true,
                      messageFormat: "{msg}",
                      errorLikeObjectKeys: ["err", "error"],
                  },
              }
            : undefined,
    redact: {
        paths: ["req.headers.cookie", "req.headers.authorization"],
        remove: true,
    },
});

export default logger;
