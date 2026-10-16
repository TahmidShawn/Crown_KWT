import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, CakeSlice, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import getRoleHome from "@/utils/roleHome";

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const homePath = getRoleHome(user?.role);
    const missingPath = location.pathname;

    return (
        <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-14">
            <div className="mx-auto w-full max-w-2xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-tl-2xl rounded-br-2xl bg-primary/10 text-primary">
                    <CakeSlice className="size-8" />
                </div>

                <p className="mb-2 text-sm font-semibold tracking-widest text-primary uppercase">
                    404 — Page not found
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Oops! This slice is missing
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                    The page you are looking for doesn&apos;t exist or was
                    moved. Check the URL or head back to something sweet.
                </p>

                {missingPath && missingPath !== "/" && (
                    <p className="mx-auto mt-3 max-w-lg truncate font-mono text-xs text-muted-foreground">
                        {missingPath}
                    </p>
                )}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                        variant="asymmetric"
                        size="lg"
                        onClick={() => navigate(homePath)}
                    >
                        <Home className="size-4" />
                        Back to home
                    </Button>

                    <Button
                        variant="outline-asymmetric"
                        size="lg"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="size-4" />
                        Go back
                    </Button>

                    <Button variant="ghost" size="lg" asChild>
                        <Link to="/search">
                            <Search className="size-4" />
                            Search cakes
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
};

export default NotFound;
