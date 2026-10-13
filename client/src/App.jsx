
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import Router from "@/router/Router";

/**
 * Root app component.
 *
 * Wires up the providers required across the whole app (theme, language,
 * authentication, react-query) and renders the react-router <Routes>.
 *
 * NOTE: The old placeholder "Hello World" content has been removed. All
 * routes/panels live in src/router/Router.jsx and src/pages/*.jsx.
 */
const App = () => {
    // The ThemeProvider (inside the component tree below) derives the initial
    // theme from the user's system preference / persisted value, so we only
    // need a static initial value here. Using `useState` would add an
    // unnecessary state+rerender for something that never changes.
    const theme = typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
        : "light";

    return (
        <ThemeProvider attribute="class" defaultTheme={theme} enableSystem>
            <LanguageProvider>
                <AuthProvider>
                    <QueryProvider>
                        <Router />
                        <Toaster />
                    </QueryProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
