import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

/**
 * Simple, dependency-free theme provider.
 *
 * The app's global CSS (src/index.css) styles both light and dark modes via
 * the `.dark` class on <html>. This provider reads the user's system
 * preference (or a persisted `theme` value) and toggles that class. It does
 * not export a hook so the module stays a single component export (fast
 * refresh friendly) and so there is no dead-code hook.
 *
 * If you prefer `next-themes`, install it and swap this out — the rest of
 * the app (index.css, Navbar, etc.) does not depend on the provider
 * implementation, only on the `ThemeContext` shape.
 */
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