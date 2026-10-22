import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
    BadgeCheck,
    Copy,
    Loader2,
    Mail,
    MoreHorizontal,
    Phone,
    Search,
    ShoppingBag,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useGet from "@/hooks/useGet";

const formatPrice = (value) => `${Number(value ?? 0).toFixed(3)} KWD`;

const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "orders-high", label: "Most orders" },
    { value: "spend-high", label: "Highest spend" },
    { value: "name-asc", label: "Name A–Z" },
];

const CustomerActions = ({ customer }) => {
    const navigate = useNavigate();

    const copy = async (value, what) => {
        if (!value) {
            toast.error(`No ${what} to copy`);
            return;
        }

        try {
            await navigator.clipboard.writeText(String(value));
            toast.success(`Copied ${what}`);
        } catch {
            toast.error(`Unable to copy ${what}`);
        }
    };

    return (
        <div
            className="flex justify-end"
            onClick={(event) => event.stopPropagation()}
        >
            <DropdownMenu>
                
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg px-2"
                            aria-label="Customer actions"
                            title="Customer actions"
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    }
                />

                <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>
                            {customer.username}
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                            onClick={() =>
                                navigate(
                                    `/admin/orders?search=${encodeURIComponent(customer.email)}`,
                                )
                            }
                        >
                            <ShoppingBag />
                            View their orders
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => copy(customer.email, "email")}
                        >
                            <Copy />
                            Copy email
                        </DropdownMenuItem>

                        {customer.phone && (
                            <DropdownMenuItem
                                onClick={() => copy(customer.phone, "phone")}
                            >
                                <Copy />
                                Copy phone
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Contact</DropdownMenuLabel>

                        <DropdownMenuItem
                            render={
                                <a href={`mailto:${customer.email}`} />
                            }
                        >
                            <Mail />
                            Email customer
                        </DropdownMenuItem>

                        {customer.phone && (
                            <DropdownMenuItem
                                render={
                                    <a
                                        href={`tel:${customer.phone}`}
                                    />
                                }
                            >
                                <Phone />
                                Call customer
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default function Customers() {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");

    const { data, isLoading, isError, refetch } = useGet({
        url: "/admin/customers",
        queryKey: ["admin", "customers"],
        retry: false,
    });

    const customers = useMemo(() => data?.data ?? [], [data]);

    const stats = useMemo(() => {

        const shoppers = customers.filter((c) => !c.isStaff);
        const withOrders = shoppers.filter((c) => c.totalOrders > 0).length;
        const repeat = shoppers.filter((c) => c.totalOrders > 1).length;
        const revenue = customers.reduce(
            (sum, c) => sum + Number(c.paidAmount ?? 0),
            0,
        );

        return {
            total: shoppers.length,
            withOrders,
            repeat,
            revenue,
        };
    }, [customers]);

    const visibleCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = customers.filter((customer) => {
            if (!query) return true;

            return [customer.username, customer.email, customer.phone].some(
                (value) =>
                    String(value ?? "")
                        .toLowerCase()
                        .includes(query),
            );
        });

        const sorted = [...filtered];

        switch (sort) {
            case "oldest":
                sorted.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                );
                break;
            case "orders-high":
                sorted.sort((a, b) => b.totalOrders - a.totalOrders);
                break;
            case "spend-high":
                sorted.sort((a, b) => b.paidAmount - a.paidAmount);
                break;
            case "name-asc":
                sorted.sort((a, b) =>
                    String(a.username ?? "").localeCompare(
                        String(b.username ?? ""),
                    ),
                );
                break;
            default:
                sorted.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                );
        }

        return sorted;
    }, [customers, search, sort]);

    if (isLoading) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <Loader2 className="size-7 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border bg-background p-10 text-center">
                <h2 className="text-lg font-bold text-foreground">
                    Failed to load customers
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Something went wrong while fetching customers.
                </p>

                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => refetch()}
                >
                    Try again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Customers
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Everyone who has an account on your store.
                </p>
            </div>

            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border bg-background p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Shoppers
                        </span>

                        <Users className="size-4 text-muted-foreground" />
                    </div>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {stats.total}
                    </p>
                </div>

                <div className="rounded-2xl border bg-background p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Have ordered
                        </span>

                        <ShoppingBag className="size-4 text-muted-foreground" />
                    </div>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {stats.withOrders}
                    </p>
                </div>

                <div className="rounded-2xl border bg-background p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Repeat customers
                        </span>

                        <BadgeCheck className="size-4 text-muted-foreground" />
                    </div>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {stats.repeat}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Ordered more than once
                    </p>
                </div>

                <div className="rounded-2xl border bg-background p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Lifetime value
                        </span>

                        <ShoppingBag className="size-4 text-muted-foreground" />
                    </div>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {formatPrice(stats.revenue)}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Sum of every order total
                    </p>
                </div>
            </div>

            
            <div className="flex flex-col gap-3 rounded-2xl border bg-background p-5 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, email, or phone..."
                        className="h-11 rounded-xl pl-11 pr-4 text-[15px] shadow-none"
                    />
                </div>

                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="h-11 w-full rounded-xl sm:w-48">
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            
            {visibleCustomers.length === 0 ? (
                <div className="rounded-2xl border bg-background p-10 text-center">
                    <h2 className="text-lg font-bold text-foreground">
                        {customers.length === 0
                            ? "No customers yet"
                            : "No results"}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {customers.length === 0
                            ? "People who register on your store will appear here."
                            : "No customers match your search."}
                    </p>

                    {customers.length > 0 && search && (
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setSearch("")}
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border bg-card">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-12 px-5">
                                        Customer
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Phone
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Orders
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Total spent
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Last order
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Joined
                                    </TableHead>

                                    <TableHead className="h-12 px-5 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {visibleCustomers.map((customer) => (
                                    <TableRow key={customer._id}>
                                        <TableCell className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                    {String(
                                                        customer.username ?? "?",
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="truncate font-medium text-foreground">
                                                            {customer.username}
                                                        </span>

                                                        {customer.isVerified && (
                                                            <BadgeCheck
                                                                className="size-3.5 shrink-0 text-primary"
                                                                aria-label="Verified"
                                                            />
                                                        )}

                                                        {customer.isStaff && (
                                                            <Badge variant="secondary">
                                                                Staff
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {customer.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                                            {customer.phone || "—"}
                                        </TableCell>

                                        <TableCell className="px-5 py-4">
                                            {customer.totalOrders > 0 ? (
                                                <Badge>
                                                    {customer.totalOrders}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    None
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 font-medium text-foreground">
                                            {formatPrice(customer.paidAmount)}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                                            {formatDate(customer.lastOrderAt)}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                                            {formatDate(customer.createdAt)}
                                        </TableCell>

                                        <TableCell className="px-5 py-4">
                                            <CustomerActions
                                                customer={customer}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
