import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router";

import useAuth from "@/hooks/useAuth";
import getRoleHome from "@/utils/roleHome";

const RedirectIfAuthenticated = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        const from = location.state?.from?.pathname;

        // Only honour the return path if it doesn't point back into an auth
        // page (avoids a redirect loop).
        if (from && !from.startsWith("/auth")) {
            return <Navigate to={from} replace />;
        }

        return <Navigate to={getRoleHome(user?.role)} replace />;
    }

    return children;
};

export default RedirectIfAuthenticated;
