import { useEffect, useRef, useState } from "react";

import { translateText } from "@/utils/translation";

export default function useAutoTranslate({
    value,
    sourceLanguage = "en",
    targetLanguage = "ar",
    delay = 700,
    enabled = true,
}) {
    const [translatedValue, setTranslatedValue] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);

    const requestIdRef = useRef(0);

    useEffect(() => {
        if (!enabled || !value.trim()) {
            setTranslatedValue("");
            setIsTranslating(false);
            setError(null);

            return;
        }

        const requestId = ++requestIdRef.current;

        const timer = setTimeout(async () => {
            try {
                setIsTranslating(true);
                setError(null);

                const translation = await translateText(
                    value,
                    sourceLanguage,
                    targetLanguage,
                );

                if (requestId !== requestIdRef.current) {
                    return;
                }

                setTranslatedValue(translation);
            } catch (error) {
                if (requestId !== requestIdRef.current) {
                    return;
                }

                setError(error);
            } finally {
                if (requestId === requestIdRef.current) {
                    setIsTranslating(false);
                }
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [value, sourceLanguage, targetLanguage, delay, enabled]);

    return {
        translatedValue,
        isTranslating,
        error,
    };
}
