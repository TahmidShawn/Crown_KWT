import { Edit, ImageOff, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import useGet from "@/hooks/useGet";
const formatPrice = (price) => `${Number(price ?? 0).toFixed(3)} KWD`;
export default function AddOns() {
    const [search, setSearch] = useState("");
    const [addOnToDelete, setAddOnToDelete] = useState(null);
    const { data: addOnsResponse, isLoading, refetch } = useGet({ url: "/admin/add-ons", queryKey: ["admin", "add-ons"] });
    const addOns = addOnsResponse?.data || [];
    const { mutate: deleteAddOn, isPending: isDeleting } = useMutation({
        mutationFn: async (addOnId) => { const response = await api.delete(`/admin/add-ons/${addOnId}`); return response.data; },
        onSuccess: (response) => { toast.success(response?.message || "Add-on deleted successfully"); setAddOnToDelete(null); refetch(); },
        onError: (error) => { toast.error(error?.response?.data?.message || "Failed to delete add-on"); },
    });
    const filteredAddOns = addOns.filter((addOn) => { const v = search.trim().toLowerCase(); if (!v) return true; return addOn.name?.en?.toLowerCase().includes(v) || addOn.name?.ar?.toLowerCase().includes(v) || String(addOn.price ?? "").includes(v); });
    const handleDelete = () => { if (!addOnToDelete) return; deleteAddOn(addOnToDelete._id); };
    return (
        <>
            <div className="space-y-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div><h1 className="text-2xl font-semibold tracking-tight">Add-ons</h1><p className="mt-1 text-sm text-muted-foreground">Manage extra add-ons customers can pick in cart.</p></div>
                    <Button asChild variant="asymmetric" className="h-12 px-5"><Link to="/admin/add-ons/add" className="flex items-center"><Plus className="mr-2 size-4" />Add Add-on</Link></Button>
                </div>
                <div className="rounded-2xl border bg-background p-5"><div className="relative max-w-md bg-white"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search add-ons..." className="h-12 rounded-xl pl-11 pr-4 text-[15px] shadow-none" /></div></div>
                <div className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="h-12 w-[90px] px-5">Image</TableHead><TableHead className="h-12 px-5">Add-on</TableHead><TableHead className="h-12 px-5">Arabic</TableHead><TableHead className="h-12 px-5">Price</TableHead><TableHead className="h-12 px-5">Status</TableHead><TableHead className="h-12 px-5 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{isLoading ? (<TableRow><TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">Loading add-ons...</TableCell></TableRow>) : filteredAddOns.length === 0 ? (<TableRow><TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">{search ? "No add-ons found." : "No add-ons available."}</TableCell></TableRow>) : (filteredAddOns.map((addOn) => (<TableRow key={addOn._id} className="hover:bg-muted/30"><TableCell className="px-5 py-4"><div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border bg-muted">{addOn.imageUrl ? (<img src={addOn.imageUrl} alt={addOn.name?.en || "Add-on"} className="size-full object-cover" />) : (<ImageOff className="size-5 text-muted-foreground" />)}</div></TableCell><TableCell className="px-5 py-4"><span className="font-medium">{addOn.name?.en || "\u2014"}</span></TableCell><TableCell className="px-5 py-4"><span dir="rtl" className="font-medium">{addOn.name?.ar || "\u2014"}</span></TableCell><TableCell className="px-5 py-4"><span className="text-sm font-medium">{formatPrice(addOn.price)}</span></TableCell><TableCell className="px-5 py-4"><span className={addOn.isActive ? "text-sm font-medium text-green-600" : "text-sm font-medium text-muted-foreground"}>{addOn.isActive ? "Active" : "Inactive"}</span></TableCell><TableCell className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/admin/add-ons/${addOn._id}`} aria-label={`Edit ${addOn.name?.en || "add-on"}`} className="inline-flex size-10 items-center justify-center rounded-tl-xl rounded-br-xl border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground"><Edit className="size-4" /></Link><Button type="button" variant="outline" size="icon" disabled={isDeleting} onClick={() => setAddOnToDelete(addOn)} aria-label={`Delete ${addOn.name?.en || "add-on"}`} className="size-10 rounded-tl-xl rounded-br-xl text-destructive cursor-pointer hover:text-white hover:bg-red-500"><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)))}</TableBody></Table></div></div>
                {!isLoading && addOns.length > 0 && (<p className="text-sm text-muted-foreground">Showing {filteredAddOns.length} of {addOns.length} add-ons</p>)}
            </div>
            <AlertDialog open={!!addOnToDelete} onOpenChange={(open) => { if (!open && !isDeleting) setAddOnToDelete(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete add-on?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete <span className="font-medium text-foreground">{addOnToDelete?.name?.en}</span>? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction disabled={isDeleting} onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </>
    );
}
