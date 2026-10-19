import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);


export const ThemeProvider = ({ defaultTheme = "system", enableSystem = false, ...props }) => {
    const [theme, setTheme] = useState(
        () =>
            (typeof window !== "undefined" && localStorage.getItem("theme")) ||
            (enableSystem
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                : defaultTheme),
    );

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme);
        if (typeof window !== "undefined") {
            localStorage.setItem("theme", theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme,
                resolvedTheme: theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme,
            }}
            {...props}
        />
    );
};
