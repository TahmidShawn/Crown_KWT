import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import {
    Bell,
    Cake,
    ChevronDown,
    LayoutDashboard,
    Menu,
    PackagePlus,
    ShoppingBag,
    Tags,
    Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigationGroups = [
    {
        title: "Orders",
        icon: ShoppingBag,
        items: [
            { title: "All Orders", path: "/admin/orders" },
            { title: "Pending", path: "/admin/orders/pending" },
            { title: "Confirmed", path: "/admin/orders/confirmed" },
            {
                title: "Out for Delivery",
                path: "/admin/orders/out-for-delivery",
            },
            { title: "Delivered", path: "/admin/orders/delivered" },
            { title: "Cancelled", path: "/admin/orders/cancelled" },
        ],
    },
    {
        title: "Cakes",
        icon: Cake,
        items: [
            { title: "All Cakes", path: "/admin/cakes" },
            { title: "Add Cake", path: "/admin/cakes/add" },
        ],
    },
    {
        title: "Categories",
        icon: Tags,
        items: [
            { title: "All Categories", path: "/admin/categories" },
            { title: "Add Category", path: "/admin/categories/add" },
        ],
    },
    {
        title: "Add-ons",
        icon: PackagePlus,
        items: [
            { title: "All Add-ons", path: "/admin/add-ons" },
            { title: "Add Add-on", path: "/admin/add-ons/add" },
        ],
    },
];

const simpleNavigation = [
    {
        title: "Customers",
        path: "/admin/customers",
        icon: Users,
    },
];

function SidebarContent({ onNavigate }) {
    const location = useLocation();

    const isGroupActive = (items) =>
        items.some((item) => {
            return (
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`)
            );
        });

    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-20 items-center justify-start border-b px-5">
                <NavLink
                    to="/"
                    onClick={onNavigate}
                    className="flex items-center gap-3"
                >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-tl-2xl rounded-br-2xl bg-primary text-primary-foreground">
                        <Cake className="size-5" />
                    </div>

                    <div className="flex flex-col">
                        <span className="font-semibold leading-none tracking-tight">
                            Crown Kwt
                        </span>

                        <span className="mt-1 text-xs text-muted-foreground">
                            Admin Panel
                        </span>
                    </div>
                </NavLink>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-5">
                <div className="space-y-2">
                    {/* Dashboard */}
                    <NavLink
                        to="/admin"
                        onClick={onNavigate}
                        end
                        className={({ isActive }) =>
                            `group flex h-11 items-center gap-3 rounded-xl px-3 transition-colors ${
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`
                        }
                    >
                        <LayoutDashboard className="size-5 shrink-0" />

                        <span className="text-sm font-medium">Dashboard</span>
                    </NavLink>

                    {/* Dropdown Groups */}
                    {navigationGroups.map((group) => {
                        const Icon = group.icon;
                        const active = isGroupActive(group.items);

                        return (
                            <Collapsible
                                key={group.title}
                                defaultOpen={active}
                                className="w-full"
                            >
                                <CollapsibleTrigger
                                    className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors ${
                                        active
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="size-5 shrink-0" />

                                    <span className="flex-1 text-sm font-medium">
                                        {group.title}
                                    </span>

                                    <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <div className="ml-5 mt-1 space-y-1 border-l pl-3">
                                        {group.items.map((item) => (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={onNavigate}
                                                end
                                                className={({ isActive }) =>
                                                    `flex min-h-9 items-center rounded-lg px-3 text-sm transition-colors ${
                                                        isActive
                                                            ? "bg-primary text-primary-foreground"
                                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    }`
                                                }
                                            >
                                                {item.title}
                                            </NavLink>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}

                    {/* Simple Navigation */}
                    <div className="pt-2">
                        {simpleNavigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onNavigate}
                                    end
                                    className={({ isActive }) =>
                                        `group flex h-11 items-center gap-3 rounded-xl px-3 transition-colors ${
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`
                                    }
                                >
                                    <Icon className="size-5 shrink-0" />

                                    <span className="text-sm font-medium">
                                        {item.title}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t p-3">
                <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-xs font-medium">Crown Kwt Admin</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Manage your store
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <div className="min-h-screen bg-muted/30">
                {/* Desktop Sidebar — always expanded; there is no collapse toggle */}
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:block">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar — content belongs to the same Sheet root as the trigger below */}
                <SheetContent side="left" className="w-72 p-0">
                    <SidebarContent onNavigate={() => setMobileOpen(false)} />
                </SheetContent>

                {/* Main */}
                <div className="min-h-screen lg:pl-64">
                    {/* Header */}
                    <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background/95 px-4 backdrop-blur md:px-6">
                        <div className="flex items-center gap-3">
                            {/* Mobile Menu */}
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    aria-label="Open menu"
                                >
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>

                        <div>
                            <h1 className="text-lg font-semibold">
                                Admin Dashboard
                            </h1>

                            <p className="hidden text-xs text-muted-foreground sm:block">
                                Manage your Crown Kwt store
                            </p>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                        >
                            <Bell className="size-5" />

                            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
            </div>
        </Sheet>
    );
}
