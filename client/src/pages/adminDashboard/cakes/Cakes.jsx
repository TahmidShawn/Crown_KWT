import { Edit, ImageOff, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/api/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import useGet from "@/hooks/useGet";
import { formatFlavorList, normalizeFlavors } from "@/utils/flavor";

export default function Cakes() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [cakeToDelete, setCakeToDelete] = useState(null);

    const params = {
        page,
        limit: 20,
    };

    const {
        data: cakesResponse,
        isLoading,
        refetch,
    } = useGet({
        url: "/admin/cakes",
        params,
        queryKey: ["admin", "cakes", page],
    });

    const cakes = cakesResponse?.data || [];
    const pagination = cakesResponse?.pagination;

    const { mutate: deleteCake, isPending: isDeleting } = useMutation({
        mutationFn: async (cakeId) => {
            const response = await api.delete(`/admin/cakes/${cakeId}`);
            return response.data;
        },
        onSuccess: (response) => {
            toast.success(response?.message || "Cake deleted successfully");
            setCakeToDelete(null);
            refetch();
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message || "Failed to delete cake",
            );
        },
    });

    const filteredCakes = cakes.filter((cake) => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) return true;

        const flavors = normalizeFlavors(cake.flavor);

        return (
            cake.name?.en?.toLowerCase().includes(searchValue) ||
            cake.name?.ar?.toLowerCase().includes(searchValue) ||
            cake.category?.name?.en?.toLowerCase().includes(searchValue) ||
            flavors.some((flavor) =>
                flavor.toLowerCase().includes(searchValue),
            )
        );
    });

    // Reset page to 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleDelete = () => {
        if (!cakeToDelete) return;

        deleteCake(cakeToDelete._id);
    };

    const getCakeImage = (cake) => {
        if (cake.images?.length > 0) {
            return cake.images[0]?.url || cake.images[0];
        }

        return cake.imageUrl || null;
    };

    return (
        <>
            <div className="space-y-8">
                
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Cakes
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your cake products.
                        </p>
                    </div>

                    <Button asChild variant="asymmetric" className="h-12 px-5">
                        <Link
                            to="/admin/cakes/add"
                            className="flex items-center"
                        >
                            <Plus className="mr-2 size-4" />
                            Add Cake
                        </Link>
                    </Button>
                </div>

                
                <div className="rounded-2xl border bg-background p-5">
                    <div className="relative max-w-md bg-card">
                        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search cakes..."
                            className="h-12 rounded-xl pl-11 pr-4 text-[15px] shadow-none"
                        />
                    </div>
                </div>

                
                <div className="overflow-hidden rounded-2xl border bg-card">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-12 w-[90px] px-5">
                                        Image
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Cake
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Category
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Flavor
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Size
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Price
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Stock
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Status
                                    </TableHead>

                                    <TableHead className="h-12 px-5 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="h-32 text-center text-sm text-muted-foreground"
                                        >
                                            Loading cakes...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCakes.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="h-32 text-center text-sm text-muted-foreground"
                                        >
                                            {search
                                                ? "No cakes found."
                                                : "No cakes available."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCakes.map((cake) => {
                                        const imageUrl = getCakeImage(cake);

                                        return (
                                            <TableRow
                                                key={cake._id}
                                                className="hover:bg-muted/30"
                                            >
                                                
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                                                        {imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={
                                                                    cake.name
                                                                        ?.en ||
                                                                    "Cake"
                                                                }
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageOff className="size-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </TableCell>

                                                
                                                <TableCell className="px-5 py-4">
                                                    <div className="max-w-55">
                                                        <p className="truncate font-medium">
                                                            {cake.name?.en ||
                                                                "—"}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                
                                                <TableCell className="px-5 py-4">
                                                    <span className="text-sm">
                                                        {cake.category?.name
                                                            ?.en || "—"}
                                                    </span>
                                                </TableCell>

                                                
                                                <TableCell className="px-5 py-4">
                                                    <span className="text-sm capitalize">
                                                        {formatFlavorList(
                                                            cake.flavor,
                                                        ) || "—"}
                                                    </span>
                                                </TableCell>

                                                
                                                <TableCell className="px-5 py-4">
                                                    <span className="text-sm capitalize">
                                                        {cake.weightSize || "—"}
                                                    </span>
                                                </TableCell>

                                                
                                                <TableCell className="px-5 py-4">
                                                    <span className="whitespace-nowrap text-sm font-medium">
                                                        {cake.price != null
                                                            ? `${Number(
                                                                  cake.price,
                                                              ).toFixed(3)} KWD`
                                                            : "—"}
                                                    </span>
                                                </TableCell>

                                                
                                                <TableCell className="px-5 py-4">
                                                    <span
                                                        className={
                                                            Number(cake.stock) >
                                                            0
                                                                ? "text-sm font-medium"
                                                                : "text-sm font-medium text-destructive"
                                                        }
                                                    >
                                                        {cake.stock ?? 0}
                                                    </span>
                                                </TableCell>

                                                
                                                <TableCell className="px-5 py-4">
                                                    <span
                                                        className={
                                                            cake.isActive
                                                                ? "text-sm font-medium text-emerald-400"
                                                                : "text-sm font-medium text-muted-foreground"
                                                        }
                                                    >
                                                        {cake.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </TableCell>

                                                
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/admin/cakes/${cake._id}`}
                                                            className="inline-flex size-10 items-center justify-center rounded-tl-xl rounded-br-xl border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
                                                            aria-label={`Edit ${
                                                                cake.name?.en ||
                                                                "cake"
                                                            }`}
                                                        >
                                                            <Edit className="size-4" />
                                                        </Link>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            disabled={
                                                                isDeleting
                                                            }
                                                            onClick={() =>
                                                                setCakeToDelete(
                                                                    cake,
                                                                )
                                                            }
                                                            aria-label={`Delete ${
                                                                cake.name?.en ||
                                                                "cake"
                                                            }`}
                                                            className="size-10 rounded-tl-xl rounded-br-xl text-destructive cursor-pointer hover:text-white hover:bg-red-500"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                
                {!isLoading && cakes.length > 0 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {page} / {pagination?.pages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(prev + 1, pagination?.pages ?? 1)
                                )
                            }
                            disabled={page >= (pagination?.pages ?? 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}

                {!isLoading && cakes.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredCakes.length} of {
                            pagination?.total ?? cakes.length
                        } cakes
                    </p>
                )}
            </div>

            
            <AlertDialog
                open={!!cakeToDelete}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setCakeToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete cake?</AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-foreground">
                                {cakeToDelete?.name?.en}
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(event) => {
                                event.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
