const requiredEnv = [
    "NODE_ENV",
    "PORT",
    "MONGODB_URI",
    "DB_NAME",
    "CORS_ORIGIN",
    "CLIENT_URL",
    "JWT_SECRET",
    "JWT_EXPIRE",
    "COOKIE_EXPIRE",
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRE",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "MYFATOORAH_API_URL",
    "MYFATOORAH_API_KEY",
    "MYFATOORAH_REDIRECTION_URL",
];

// Enforced only in production. In dev/test these can be omitted so the server
// still boots (the webhook secret is generated later in the MyFatoorah portal).
const productionEnv = ["MYFATOORAH_WEBHOOK_SECRET"];

const validateEnv = () => {
    const missing = requiredEnv.filter((key) => !process.env[key]);

    if (process.env.NODE_ENV === "production") {
        missing.push(
            ...productionEnv.filter((key) => !process.env[key]),
        );
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`,
        );
    }
};

export default validateEnv;
