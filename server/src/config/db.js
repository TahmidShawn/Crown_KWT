import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        logger.info(`MongoDB connected: ${connectionInstance.connection.host}`);

        mongoose.connection.on("error", (err) => {
            logger.error({ err }, "MongoDB runtime error");
        });

        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected");
        });

        mongoose.connection.on("reconnected", () => {
            logger.info("MongoDB reconnected");
        });
    } catch (error) {
        logger.error({ err: error }, "MongoDB connection error");
        process.exit(1);
    }
};

export default connectDB;