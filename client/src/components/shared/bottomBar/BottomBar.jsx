import {
    Cake,
    House,
    LayoutGrid,
    LogOut,
    Package,
    ShoppingBag,
    User,
} from "lucide-react";
import { Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/context/LanguageContext";
import useAuth from "@/hooks/useAuth";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";

const BottomBar = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const { isAuthenticated, isLoading, user, clearUser } = useAuth();

    const isAdmin = user?.role === "admin";
    const isCustomer = user?.role === "user";
    const queryClient = useQueryClient();

    const { mutate: logoutUser, isPending: isLoggingOut } = usePost({
        url: "/auth/logout",
        onSuccess: () => {
            clearUser();
            queryClient.removeQueries({ queryKey: ["cart"] });
        },
    });

    // Real categories from the API (route is /category/:slug — singular)
    const { data: categoriesResponse } = useGet({
        url: "/categories",
        queryKey: ["categories"],
        retry: false,
    });

    const categories = categoriesResponse?.data ?? [];

    const itemClass =
        "flex size-14 flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground transition-colors active:bg-secondary active:text-primary";

    const linkClass =
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors active:bg-secondary active:text-primary";

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
            <div className="flex h-16 items-center justify-around">
                {/* Home */}
                <Link to="/" className={itemClass}>
                    <House className="size-5" />

                    <span className="text-[10px] font-medium">
                        {isArabic ? "الرئيسية" : "Home"}
                    </span>
                </Link>

                {/* Categories */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button type="button" className={itemClass}>
                            <LayoutGrid className="size-5" />

                            <span className="text-[10px] font-medium">
                                {isArabic ? "الفئات" : "Categories"}
                            </span>
                        </button>
                    </PopoverTrigger>

                    <PopoverContent
                        side="top"
                        align="center"
                        sideOffset={8}
                        className="w-72 rounded-2xl p-2"
                    >
                        <div className="px-2.5 py-2">
                            <p className="text-sm font-bold text-foreground">
                                {isArabic ? "تصفح الفئات" : "Browse categories"}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {isArabic
                                    ? "اختر نوع الكعكة"
                                    : "Choose a cake category"}
                            </p>
                        </div>

                        {categories.length === 0 ? (
                            <p className="px-2.5 py-4 text-center text-xs text-muted-foreground">
                                {isArabic
                                    ? "لا توجد فئات"
                                    : "No categories available"}
                            </p>
                        ) : (
                            <div className="mt-1 grid max-h-72 grid-cols-2 gap-1 overflow-y-auto">
                                {categories.map((category) => (
                                    <Link
                                        key={category._id}
                                        to={`/category/${category.slug}`}
                                        className="rounded-xl px-2.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors active:bg-secondary active:text-primary"
                                    >
                                        {category.name[language]}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Orders — customers go straight to their own orders,
                    everyone else uses public tracking by order number */}
                <Link
                    to={isCustomer ? "/dashboard/orders" : "/order-tracking"}
                    className={itemClass}
                >
                    <Package className="size-5" />

                    <span className="text-[10px] font-medium">
                        {isArabic ? "الطلبات" : "Orders"}
                    </span>
                </Link>
                {/* Account */}
                {isLoading ? (
                    <div className={itemClass}>
                        <User className="size-5" />
                        <span className="text-[10px] font-medium">
                            {isArabic ? "الحساب" : "Account"}
                        </span>
                    </div>
                ) : isAuthenticated ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button type="button" className={itemClass}>
                                <User className="size-5" />

                                <span className="text-[10px] font-medium">
                                    {isArabic ? "الحساب" : "Account"}
                                </span>
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            side="top"
                            align="end"
                            sideOffset={8}
                            className="w-56 rounded-2xl p-2"
                        >
                            <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-none rounded-tl-xl rounded-br-xl bg-primary text-primary-foreground">
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

                            <div className="mt-2 space-y-1">
                                {/* Cart — customers only */}
                                {isCustomer && (
                                    <Link to="/cart" className={linkClass}>
                                        <ShoppingBag className="size-4" />
                                        {isArabic ? "السلة" : "Cart"}
                                    </Link>
                                )}

                                <Link
                                    to={isAdmin ? "/admin" : "/dashboard"}
                                    className={linkClass}
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
                                    onClick={() => logoutUser()}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors active:bg-destructive/10 active:text-destructive disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <LogOut className="size-4" />
                                    {isLoggingOut
                                        ? isArabic
                                            ? "جاري الخروج..."
                                            : "Logging out..."
                                        : isArabic
                                          ? "تسجيل الخروج"
                                          : "Logout"}
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Link to="/auth/login" className={itemClass}>
                        <User className="size-5" />

                        <span className="text-[10px] font-medium">
                            {isArabic ? "الدخول" : "Login"}
                        </span>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default BottomBar;

