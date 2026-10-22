import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

import useAuth from "@/hooks/useAuth";
import getRoleHome from "@/utils/roleHome";

const RequireAuth = ({ roles, children }) => {
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

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    if (roles && roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to={getRoleHome(user?.role)} replace />;
    }

    return children ?? <Outlet />;
};

export default RequireAuth;
