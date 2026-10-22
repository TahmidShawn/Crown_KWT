import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import { scheduleOrderExpiryJob } from "./jobs/orderExpiry.job.js";

const port = process.env.PORT || 5000;
let server;

// start the express server
const startServer = () => {
    server = app.listen(port, () => {
        logger.info(`Server is running on port ${port}`);
    });

    server.on("error", (error) => {
        logger.error({ err: error }, "Server error");
        process.exit(1);
    });
};

// handle uncaught errors
process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught Exception");
    process.exit(1);
});

// handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
    logger.fatal({ err: reason }, "Unhandled Rejection");
    process.exit(1);
});

// shutdown server and db connection gracefully
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    if (server) {
        server.close(() => logger.info("HTTP server closed"));
    }
    try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
    } catch (err) {
        logger.error({ err }, "Error while closing MongoDB connection");
    }
    process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// connect db then start server
connectDB()
    .then(() => {
        startServer();
        scheduleOrderExpiryJob();
    })
    .catch((err) => {
        logger.fatal({ err }, "Failed to connect with the database");
        process.exit(1);
    });
