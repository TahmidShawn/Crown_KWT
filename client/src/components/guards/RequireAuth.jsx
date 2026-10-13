import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

import useAuth from "@/hooks/useAuth";
import getRoleHome from "@/utils/roleHome";

/**
 * Protects a route tree so only signed-in users (optionally of specific roles)
 * can reach it. Used as a layout route wrapper — children render through
 * <Outlet />.
 *
 * Behaviour follows production RBAC best practice:
 * 1. While the session is still being resolved we render a loader instead of
 *    redirecting, so a logged-in user is never bounced to login on a hard
 *    refresh.
 * 2. Not signed in -> send to /auth/login and remember the attempted location
 *    (`state.from`) so login can return the user where they wanted to go.
 * 3. Signed in but the wrong role -> send them to their own home so an admin
 *    never lands on the customer dashboard (and vice-versa) and gets a dead
 *    end. The real security boundary is the server's authorizeRoles, this just
 *    keeps the UX sane.
 *
 * @param {{ roles?: string[] }} props
 * @param {string[]} [props.roles] - Allowed roles. Omit for "any logged-in user".
 */
const RequireAuth = ({ roles }) => {
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
        return (
            <Navigate
                to="/auth/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (roles && roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to={getRoleHome(user?.role)} replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
