import crypto from "crypto";
import logger from "./logger.js";

const WEBHOOK_SIGNATURE_HEADER = "myfatoorah-signature";
const WEBHOOK_SIGNATURE_FIELDS = [
    "Invoice.Id",
    "Invoice.Status",
    "Transaction.Status",
    "Transaction.PaymentId",
    "Invoice.ExternalIdentifier",
];

export const getWebhookSignatureFields = (data) => {
    const invoice = data?.Invoice || {};
    const transaction = data?.Transaction || {};

    return WEBHOOK_SIGNATURE_FIELDS.map((field) => {
        const [entity, key] = field.split(".");
        const value = entity === "Invoice" ? invoice[key] ?? "" : transaction[key] ?? "";
        return `${field}=${value ?? ""}`;
    });
};

const hmacSha256 = (secret, payload) =>
    crypto.createHmac("sha256", secret).update(payload, "utf8").digest("base64");

export const verifyMyFatoorahSignature = (req) => {
    const signature = req.headers[WEBHOOK_SIGNATURE_HEADER];

    if (!signature) {
        logger.warn("[webhook] signature header missing");
        return false;
    }

    // Fail closed: if no secret is configured (e.g. local dev without the
    // portal webhook secret yet), reject the webhook instead of crashing.
    const secret = process.env.MYFATOORAH_WEBHOOK_SECRET;
    if (!secret) {
        logger.error(
            "[webhook] MYFATOORAH_WEBHOOK_SECRET not set - rejecting webhook (fail closed)",
        );
        return false;
    }

    const data = req.body?.Data || {};
    const signatureData = getWebhookSignatureFields(data).join(",");

    if (!signatureData) {
        logger.warn("[webhook] signature payload empty");
        return false;
    }

    const expectedSignature = hmacSha256(secret, signatureData);

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (receivedBuffer.length !== expectedBuffer.length) {
        logger.warn({
            receivedLength: receivedBuffer.length,
            expectedLength: expectedBuffer.length,
            receivedStart: receivedBuffer.toString("hex", 0, Math.min(receivedBuffer.length, 32)),
        });
        return false;
    }

    const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

    if (!isValid) {
        logger.warn("[webhook] signature mismatch");
    }

    return isValid;
};