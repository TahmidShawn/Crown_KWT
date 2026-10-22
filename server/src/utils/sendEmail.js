import { Resend } from "resend";
import logger from "./logger.js";

let resendClient;

const getClient = () => {
    if (!resendClient) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

const sendEmail = async (options) => {
    try {
        const { error } = await getClient().emails.send({
            from: process.env.EMAIL_FROM,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        });

        if (error) {
            throw new Error(error.message || "Resend API returned an error");
        }
    } catch (error) {
        logger.error({ err: error, to: options.email }, "Failed to send email");
        throw error;
    }
};

export default sendEmail;
