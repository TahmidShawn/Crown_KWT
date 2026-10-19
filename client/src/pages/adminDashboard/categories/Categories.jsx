import { Edit, ImageOff, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
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

export default function Categories() {
    const [search, setSearch] = useState("");
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const {
        data: categoriesResponse,
        isLoading,
        refetch,
    } = useGet({
        url: "/admin/categories",
        queryKey: ["admin", "categories"],
    });

    const categories = categoriesResponse?.data || [];

    const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
        mutationFn: async (categoryId) => {
            const response = await api.delete(
                `/admin/categories/${categoryId}`,
            );

            return response.data;
        },
        onSuccess: (response) => {
            toast.success(response?.message || "Category deleted successfully");

            setCategoryToDelete(null);
            refetch();
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message || "Failed to delete category",
            );
        },
    });

    const filteredCategories = categories.filter((category) => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return true;
        }

        return (
            category.name?.en?.toLowerCase().includes(searchValue) ||
            category.name?.ar?.toLowerCase().includes(searchValue) ||
            category.slug?.toLowerCase().includes(searchValue)
        );
    });

    const handleDelete = () => {
        if (!categoryToDelete) {
            return;
        }

        deleteCategory(categoryToDelete._id);
    };

    return (
        <>
            <div className="space-y-8">
                
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Categories
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your cake categories.
                        </p>
                    </div>

                    <Button asChild variant="asymmetric" className="h-12 px-5">
                        <Link
                            to="/admin/categories/add"
                            className="flex items-center"
                        >
                            <Plus className="mr-2 size-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>

                
                <div className="rounded-2xl border bg-background p-5">
                    <div className="relative max-w-md bg-white">
                        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search categories..."
                            className="h-12 rounded-xl pl-11 pr-4 text-[15px] shadow-none"
                        />
                    </div>
                </div>

                
                <div className="overflow-hidden rounded-2xl border bg-white">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-12 w-[90px] px-5">
                                        Image
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Category
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Arabic
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Slug
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
                                            colSpan={6}
                                            className="h-32 text-center text-sm text-muted-foreground"
                                        >
                                            Loading categories...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-sm text-muted-foreground"
                                        >
                                            {search
                                                ? "No categories found."
                                                : "No categories available."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <TableRow
                                            key={category._id}
                                            className="hover:bg-muted/30"
                                        >
                                            
                                            <TableCell className="px-5 py-4">
                                                <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                                                    {category.imageUrl ? (
                                                        <img
                                                            src={
                                                                category.imageUrl
                                                            }
                                                            alt={
                                                                category.name
                                                                    ?.en ||
                                                                "Category"
                                                            }
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageOff className="size-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableCell>

                                            
                                            <TableCell className="px-5 py-4">
                                                <span className="font-medium">
                                                    {category.name?.en || "—"}
                                                </span>
                                            </TableCell>

                                            
                                            <TableCell className="px-5 py-4">
                                                <span
                                                    dir="rtl"
                                                    className="font-medium"
                                                >
                                                    {category.name?.ar || "—"}
                                                </span>
                                            </TableCell>

                                            
                                            <TableCell className="px-5 py-4">
                                                <span className="text-sm text-muted-foreground">
                                                    {category.slug || "—"}
                                                </span>
                                            </TableCell>

                                            
                                            <TableCell className="px-5 py-4">
                                                <span
                                                    className={
                                                        category.isActive
                                                            ? "text-sm font-medium text-green-600"
                                                            : "text-sm font-medium text-muted-foreground"
                                                    }
                                                >
                                                    {category.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </TableCell>

                                            
                                            <TableCell className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/admin/categories/${category._id}`}
                                                        aria-label={`Edit ${category.name?.en || "category"}`}
                                                        className="inline-flex size-10 items-center justify-center rounded-tl-xl rounded-br-xl border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
                                                    >
                                                        <Edit className="size-4" />
                                                    </Link>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        disabled={isDeleting}
                                                        onClick={() =>
                                                            setCategoryToDelete(
                                                                category,
                                                            )
                                                        }
                                                        aria-label={`Delete ${
                                                            category.name?.en ||
                                                            "category"
                                                        }`}
                                                        className="size-10 rounded-tl-xl rounded-br-xl text-destructive cursor-pointer hover:text-white hover:bg-red-500"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                
                {!isLoading && categories.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredCategories.length} of{" "}
                        {categories.length} categories
                    </p>
                )}
            </div>

            
            <AlertDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setCategoryToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-foreground">
                                {categoryToDelete?.name?.en}
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
