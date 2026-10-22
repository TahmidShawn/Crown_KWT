import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import Router from "@/router/Router";

const App = () => {

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
