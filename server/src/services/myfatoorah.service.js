// const MYFATOORAH_API_URL = process.env.MYFATOORAH_API_URL;
// const MYFATOORAH_API_KEY = process.env.MYFATOORAH_API_KEY;

// const myFatoorahRequest = async (endpoint, options = {}) => {
//     if (!MYFATOORAH_API_URL || !MYFATOORAH_API_KEY) {
//         throw new Error("MyFatoorah configuration is missing");
//     }

//     const response = await fetch(`${MYFATOORAH_API_URL}${endpoint}`, {
//         ...options,
//         headers: {
//             Authorization: `Bearer ${MYFATOORAH_API_KEY}`,
//             "Content-Type": "application/json",
//             ...(options.headers || {}),
//         },
//     });

//     const data = await response.json();

//     if (!response.ok || !data.IsSuccess) {
//         const message =
//             data.Message ||
//             data.ValidationErrors?.map((error) => error.Message)
//                 .filter(Boolean)
//                 .join(", ") ||
//             "MyFatoorah request failed";

//         throw new Error(message);
//     }

//     return data.Data;
// };

// export const createMyFatoorahPayment = async ({
//     amount,
//     orderId,
//     customer,
// }) => {
//     return myFatoorahRequest("/v3/payments", {
//         method: "POST",
//         body: JSON.stringify({
//             Order: {
//                 Amount: amount,
//             },

//             Customer: {
//                 Name: customer.name,
//                 Email: customer.email,
//             },

//             IntegrationUrls: {
//                 Redirection: process.env.MYFATOORAH_REDIRECTION_URL,
//             },

//             NotificationOption: "LINK",
//             CustomerReference: orderId,
//         }),
//     });
// };

// export const getMyFatoorahPayment = async (paymentId) => {
//     return myFatoorahRequest(`/v3/payments/${encodeURIComponent(paymentId)}`, {
//         method: "GET",
//     });
// };

const getConfig = () => {
    const baseUrl = process.env.MYFATOORAH_API_URL?.trim().replace(/\/+$/, "");
    const apiKey = process.env.MYFATOORAH_API_KEY?.trim();

    if (!baseUrl || !apiKey) {
        throw new Error(
            "MyFatoorah configuration is missing (MYFATOORAH_API_URL / MYFATOORAH_API_KEY)",
        );
    }

    return { baseUrl, apiKey };
};

const GATEWAY_TIMEOUT_MS = 20_000;

const myFatoorahRequest = async (endpoint, options = {}) => {
    const { baseUrl, apiKey } = getConfig();
    const url = `${baseUrl}${endpoint}`;

    // Unique idempotency key per payment call so MyFatoorah can safely retry
    // without creating duplicate invoices on the gateway side.
    const idempotencyKey = `order_${options?.orderId ?? Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "x-idempotency-key": idempotencyKey,
            ...(options.headers || {}),
        },
    });

    const rawText = await response.text();

    let data;

    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch {
        throw new Error(
            `MyFatoorah returned a non-JSON response (HTTP ${response.status}) from ${url}: ${rawText.slice(0, 300)}`,
        );
    }

    if (!response.ok || data.IsSuccess === false) {
        const message =
            data.Message ||
            data.ValidationErrors?.map((error) => error.Message)
                .filter(Boolean)
                .join(", ") ||
            "MyFatoorah request failed";

        throw new Error(
            `MyFatoorah error (HTTP ${response.status}): ${message} | ${JSON.stringify(data).slice(0, 500)}`,
        );
    }

    return data.Data;
};

export const createMyFatoorahPayment = async ({
    amount,
    orderId,
    customer,
}) => {
    return myFatoorahRequest("/v3/payments", {
        method: "POST",
        body: JSON.stringify({
            Order: {
                Amount: amount,
                Currency: "KWD",
            },

            Customer: {
                Name: customer.name,
                Email: customer.email,
            },

            IntegrationUrls: {
                Redirection: process.env.MYFATOORAH_REDIRECTION_URL,
            },

            NotificationOption: "LINK",
            CustomerReference: orderId,
        }),
    });
};

export const getMyFatoorahPayment = async (paymentId) => {
    return myFatoorahRequest(`/v3/payments/${encodeURIComponent(paymentId)}`, {
        method: "GET",
    });
};
