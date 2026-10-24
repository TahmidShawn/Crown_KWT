import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import cookieParser from "cookie-parser";
import ErrorHandler from "./utils/errorHandler.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import logger from "./utils/logger.js";
import validateEnv from "./config/validateEnv.js";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";

// import routes
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import categoryRouter from "./routes/category.route.js";
import cakeRouter from "./routes/cake.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import paymentRouter from "./routes/payment.route.js";
import addOnRouter from "./routes/addOn.route.js";
import reviewRouter from "./routes/review.route.js";
import statsRouter from "./routes/stats.route.js";

// env check

validateEnv();
const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
    pinoHttp({
        logger,
        serializers: {
            req(req) {
                return { method: req.method, url: req.url };
            },
            res(res) {
                return { statusCode: res.statusCode };
            },
        },
        customSuccessMessage: (req, res, responseTime) =>
            `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`,
        autoLogging: {
            ignore: (req) => req.url === "/health",
        },
    }),
);
const allowedOrigins = process.env.CORS_ORIGIN.split(",").map((origin) =>
    origin.trim(),
);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// global rate limit
app.use(globalLimiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// health check — for load balancers / orchestrators
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// root
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", service: "december-cake-api" });
});

// router

app.use("/api/v1", authRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", cakeRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1", addOnRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1", statsRouter);

app.use((req, res, next) => {
    next(new ErrorHandler(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorMiddleware);

export default app;
