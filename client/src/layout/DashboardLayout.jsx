import {
    Clock,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Settings,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import useAuth from "@/hooks/useAuth";
import usePost from "@/hooks/usePost";

const navigation = [
    {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
        end: true,
    },
    {
        label: "My Orders",
        to: "/dashboard/orders",
        icon: Package,
    },
    {
        label: "Profile",
        to: "/dashboard/profile",
        icon: User,
    },
    {
        label: "Settings",
        to: "/dashboard/settings",
        icon: Settings,
    },
];

const getGreeting = (hour) => {
    if (hour >= 5 && hour < 12) {
        return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
        return "Good afternoon";
    }

    if (hour >= 17 && hour < 21) {
        return "Good evening";
    }

    return "Good night";
};

/*
 * Live time + date for the top bar. Lives in its own component so the
 * ticking second only re-renders the clock instead of the whole layout.
 */
const LiveClock = () => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);

        return () => clearInterval(interval);
    }, []);

    const time = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const date = now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="flex shrink-0 items-center gap-2.5 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-3 py-2 shadow-sm sm:gap-3 sm:px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Clock className="size-4" />
            </div>

            <div className="leading-tight">
                <p className="text-sm font-bold tabular-nums text-foreground">
                    {time}
                </p>

                <p className="hidden text-[11px] text-muted-foreground sm:block">
                    {date}
                </p>
            </div>
        </div>
    );
};

const DashboardLayout = () => {
    const [open, setOpen] = useState(false);
    const [greeting, setGreeting] = useState(() =>
        getGreeting(new Date().getHours()),
    );

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { user, clearUser } = useAuth();

    const userName = user?.username || "there";
    const userInitial = userName.trim().charAt(0).toUpperCase() || "C";

    const { mutate: logoutUser, isPending: isLoggingOut } = usePost({
        url: "/auth/logout",
        onSuccess: () => {
            clearUser();
            queryClient.removeQueries({ queryKey: ["cart"] });
            navigate("/");
        },
    });

    // Refresh the time-of-day greeting every minute.
    useEffect(() => {
        const interval = setInterval(() => {
            setGreeting(getGreeting(new Date().getHours()));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logoutUser();
    };

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="flex min-h-screen w-full">
                {/*
                 * Desktop sidebar — sticky at viewport height so the logout
                 * button stays pinned at the bottom-left without scrolling.
                 */}
                <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
                    {/*
                     * Same construction as the top bar: the border sits
                     * INSIDE the h-20 box, so the logo line and the header
                     * border-b land at exactly the same level.
                     */}
                    <div className="flex h-20 shrink-0 items-center border-b border-border px-6">
                        <NavLink
                            to="/"
                            className="text-xl font-bold tracking-tight"
                        >
                            Crown <span className="text-primary">Kwt</span>
                        </NavLink>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 pt-6">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`
                                    }
                                >
                                    <Icon className="size-[18px] shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Always-visible footer: user card + logout (bottom-left) */}
                    <div className="shrink-0 border-t border-border p-4">
                        <div className="mb-3 flex items-center gap-3 px-2">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-none rounded-tl-xl rounded-br-xl bg-primary text-sm font-bold text-primary-foreground">
                                {userInitial}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {user?.username || "Guest"}
                                </p>

                                <p className="truncate text-[11px] text-muted-foreground">
                                    {user?.email || ""}
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isLoggingOut}
                            onClick={handleLogout}
                            className="w-full justify-start gap-3 rounded-xl px-4 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                        >
                            <LogOut className="size-[18px]" />
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </Button>
                    </div>
                </aside>

                {/* Main Area */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/*
                     * Top bar — greeting + user name on the left, live clock
                     * and account chip on the right. The hamburger only shows
                     * below lg (desktop uses the sidebar).
                     */}
                    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Open menu"
                                    className="shrink-0 rounded-xl lg:hidden"
                                >
                                    <Menu className="size-5" />
                                    <span className="sr-only">
                                        Open dashboard menu
                                    </span>
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="left"
                                className="w-72 gap-0 p-0"
                            >
                                <SheetHeader className="border-b px-6 py-6 text-left">
                                    <SheetTitle>
                                        <NavLink
                                            to="/"
                                            onClick={() => setOpen(false)}
                                            className="text-xl font-bold tracking-tight"
                                        >
                                            Crown{" "}
                                            <span className="text-primary">
                                                Kwt
                                            </span>
                                        </NavLink>
                                    </SheetTitle>
                                </SheetHeader>

                                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                                    {navigation.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <NavLink
                                                key={item.to}
                                                to={item.to}
                                                end={item.end}
                                                onClick={() => setOpen(false)}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                                        isActive
                                                            ? "bg-primary text-primary-foreground shadow-sm"
                                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    }`
                                                }
                                            >
                                                <Icon className="size-[18px] shrink-0" />
                                                <span>{item.label}</span>
                                            </NavLink>
                                        );
                                    })}
                                </nav>

                                {/* Pinned at the bottom of the sheet */}
                                <div className="shrink-0 border-t border-border p-4">
                                    <div className="mb-3 flex items-center gap-3 px-2">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-none rounded-tl-xl rounded-br-xl bg-primary text-sm font-bold text-primary-foreground">
                                            {userInitial}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {user?.username || "Guest"}
                                            </p>

                                            <p className="truncate text-[11px] text-muted-foreground">
                                                {user?.email || ""}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        disabled={isLoggingOut}
                                        onClick={handleLogout}
                                        className="w-full justify-start gap-3 rounded-xl px-4 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <LogOut className="size-[18px]" />
                                        {isLoggingOut
                                            ? "Logging out..."
                                            : "Logout"}
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Hello + greeting */}
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                                {greeting}
                            </p>

                            <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
                                Hello, {userName}{" "}
                                <span aria-hidden="true">👋</span>
                            </h1>
                        </div>

                        {/* Live time section */}
                        <LiveClock />
                    </header>

                    <main className="min-w-0 flex-1">{<Outlet />}</main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;