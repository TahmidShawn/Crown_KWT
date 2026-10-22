import { createContext, useContext, useEffect, useState } from "react";

import { translations } from "@/data/data";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState("en");

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "en" ? "ar" : "en"));
    };

    const t = translations[language];

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }, [language]);

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                toggleLanguage,
                t,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error("useLanguage must be used inside LanguageProvider");
    }

    return context;
};
