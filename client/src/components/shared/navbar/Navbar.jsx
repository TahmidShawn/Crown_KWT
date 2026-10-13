import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    Cake,
    Languages,
    LayoutGrid,
    LogOut,
    Package,
    Search,
    ShoppingCart,
    User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { useLanguage } from "@/context/LanguageContext";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const searchInputRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    /*
     * The search box mirrors ?query=/search= on the category/product routes
     * and clears itself elsewhere. Adjusting state during render (React's
     * recommended pattern) keeps it in sync without a cascading effect.
     */
    const searchFromUrl =
        location.pathname === "/search"
            ? new URLSearchParams(location.search).get("query") ??
              new URLSearchParams(location.search).get("search")
            : "";

    const [search, setSearch] = useState(searchFromUrl);
    const [prevUrlSearch, setPrevUrlSearch] = useState(searchFromUrl);

    if (searchFromUrl !== prevUrlSearch) {
        setPrevUrlSearch(searchFromUrl);
        setSearch(searchFromUrl);
    }

    const { language, toggleLanguage, t } = useLanguage();
    const isArabic = language === "ar";

    const { isAuthenticated, isLoading, user, clearUser } = useAuth();

    const isAdmin = user?.role === "admin";
    const isCustomer = user?.role === "user";

    const queryClient = useQueryClient();

    // Live cart item count for the navbar badge (customers only — admins
    // don't shop, and the cart API is restricted to the "user" role).
    const { data: cartResponse } = useGet({
        url: "/cart",
        queryKey: ["cart"],
        enabled: isCustomer,
        retry: false,
    });

    const cartCount = cartResponse?.data?.totalItems ?? 0;

    const { mutate: logoutUser, isPending: isLoggingOut } = usePost({
        url: "/auth/logout",
        onSuccess: () => {
            clearUser();
            queryClient.removeQueries({ queryKey: ["cart"] });
        },
    });

    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "k") {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    // Mobile navigation lives in the bottom bar; the navbar only shows the
    // "Track Order" shortcut as an icon on md+ screens.

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Global "/" shortcut focuses the search box (ignored while typing).
    useEffect(() => {
        const handleKeyDown = (event) => {
            const target = event.target;

            const isTyping =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                target?.isContentEditable;

            if (event.key === "/" && !isTyping) {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleLogout = () => {
        logoutUser();
    };

    const handleSearch = (event) => {
        event.preventDefault();

        const term = search.trim();

        if (!term) {
            searchInputRef.current?.focus();
            return;
        }

        navigate(`/search?query=${encodeURIComponent(term)}`);
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background/95 text-foreground backdrop-blur-md"
            }`}
        >
            <div className="wrapper flex h-16 items-center gap-2 sm:h-17 sm:gap-4">
                {/* Logo */}
                <Link
                    to="/"
                    aria-label="Crown Kwt home"
                    className="flex shrink-0 items-center gap-2"
                >
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors ${
                            scrolled
                                ? "bg-primary-foreground/15"
                                : "bg-secondary"
                        }`}
                    >
                        <Cake
                            className={`h-5 w-5 ${
                                scrolled
                                    ? "text-primary-foreground"
                                    : "text-primary"
                            }`}
                        />
                    </div>

                    <span className="hidden text-lg font-bold tracking-tight sm:block">
                        Crown Kwt
                    </span>
                </Link>



                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="mx-auto w-full min-w-0 max-w-xl"
                    role="search"
                >
                    <div className="relative">
                        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            ref={searchInputRef}
                            dir="auto"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t.nav.search}
                            aria-label={t.nav.search}
                            autoComplete="off"
                            className={`h-10 rounded-none rounded-tl-xl rounded-br-xl pe-4 text-start shadow-none transition-all duration-300 [direction:inherit] focus-visible:ring-1 ${
                                language === "ar" ? "pe-10 ps-4" : "pe-4 ps-10"
                            } ${
                                scrolled
                                    ? "border-transparent bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                                    : "border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
                            }`}
                        />
                    </div>
                </form>

                {/* Track order - md+ icon only; mobile uses the bottom bar */}
                <Link to="/order-tracking" className="hidden shrink-0 md:block">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={isArabic ? "تتبع الطلب" : "Track order"}
                        title={isArabic ? "تتبع الطلب" : "Track order"}
                        className={`cursor-pointer ${
                            scrolled
                                ? "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                : "text-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                        <Package className="h-5 w-5" />
                    </Button>
                </Link>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                    {/* Cart — customers only (admins manage the shop, they don't
                        shop, and the cart API is user-only) */}
                    {isCustomer && (
                        <Link to="/cart" className="relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`cursor-pointer ${
                                scrolled
                                    ? "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                    : "text-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                        >
                            <ShoppingCart className="h-5 w-5" />

                            {cartCount > 0 && (
                                <span
                                    dir="ltr"
                                    className="absolute -top-0.5 inset-e-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white"
                                >
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                    )}

                    {/* User / Login */}
                    {isLoading ? null : isAuthenticated ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={`hidden cursor-pointer md:inline-flex ${
                                        scrolled
                                            ? "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                            : "text-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                side="bottom"
                                align="end"
                                sideOffset={10}
                                className="w-56 rounded-2xl p-2"
                            >
                                {/* Account Header */}
                                <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl bg-primary text-primary-foreground">
                                        <Cake className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-foreground">
                                            {isArabic ? "حسابي" : "My account"}
                                        </p>

                                        <p className="text-[11px] text-muted-foreground">
                                            {isArabic
                                                ? "إدارة حسابك"
                                                : "Manage your account"}
                                        </p>
                                    </div>
                                </div>

                                {/* Account Options */}
                                <div className="mt-2 space-y-1">
                                    <Link
                                        to={isAdmin ? "/admin" : "/dashboard"}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                                    >
                                        <LayoutGrid className="size-4" />

                                        {isAdmin
                                            ? isArabic
                                                ? "لوحة الإدارة"
                                                : "Admin Panel"
                                            : isArabic
                                              ? "لوحة التحكم"
                                              : "Dashboard"}
                                    </Link>

                                    <button
                                        type="button"
                                        disabled={isLoggingOut}
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <LogOut className="size-4" />

                                        {isLoggingOut
                                            ? isArabic
                                                ? "جاري تسجيل الخروج..."
                                                : "Logging out..."
                                            : isArabic
                                              ? "تسجيل الخروج"
                                              : "Logout"}
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <Link to="/auth/login">
                            <Button
                                type="button"
                                variant="outline-asymmetric"
                                className={
                                    scrolled
                                        ? "border-primary-foreground/25 bg-transparent px-2.5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:px-3"
                                        : "bg-card px-2.5 text-foreground sm:px-3"
                                }
                            >
                                <User className="h-4 w-4" />

                                <span className="hidden sm:inline">
                                    {isArabic ? "تسجيل الدخول" : "Login"}
                                </span>
                            </Button>
                        </Link>
                    )}

                    {/* Language */}
                    <Button
                        type="button"
                        variant="outline-asymmetric"
                        onClick={toggleLanguage}
                        className={
                            scrolled
                                ? "border-primary-foreground/25 bg-transparent px-2.5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:px-3"
                                : "bg-card px-2.5 text-foreground sm:px-3"
                        }
                    >
                        <Languages className="h-4 w-4" />

                        <span className="hidden sm:inline">
                            {t.nav.language}
                        </span>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
