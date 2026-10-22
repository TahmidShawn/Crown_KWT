import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import Router from "./router/Router";
import { LanguageProvider } from "./context/LanguageContext";
import QueryProvider from "./providers/QueryProvider";
import AuthProvider from "./context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider attribute="class" enableSystem>
                <HelmetProvider>
                    <QueryProvider>
                        <LanguageProvider>
                            <GoogleOAuthProvider
                                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                            >
                                <AuthProvider>
                                    <Router />
                                    <Toaster />
                                </AuthProvider>
                            </GoogleOAuthProvider>
                        </LanguageProvider>
                    </QueryProvider>
                </HelmetProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
);
