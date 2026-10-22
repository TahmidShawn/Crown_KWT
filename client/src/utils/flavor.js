/*
 * The API exposes `flavor` as an array of slugs, but legacy records may
 * still hold a single comma separated string (e.g. "chocolate,vanilla").
 * Aggregation results also bypass Mongoose casting, so both shapes can
 * reach the client. Normalize them into a flat array of trimmed slugs so
 * components can always render flavors safely.
 */
export const normalizeFlavors = (flavor) => {
    if (Array.isArray(flavor)) {
        return flavor
            .flatMap((item) =>
                typeof item === "string" ? item.split(",") : [],
            )
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof flavor === "string") {
        return flavor
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

/* Turn a flavor slug into a human readable label ("red-velvet" -> "Red Velvet"). */
export const formatFlavorLabel = (flavor) =>
    String(flavor ?? "")
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

/* Join every flavor of a cake into a single readable string. */
export const formatFlavorList = (flavor, separator = ", ") =>
    normalizeFlavors(flavor).map(formatFlavorLabel).join(separator);
