import { MapPin, Plus } from "lucide-react";

const Addresses = () => {
    return (
        <div className="p-5 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-sm font-semibold text-primary">
                        Account
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight">
                        My addresses
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Manage your saved delivery addresses.
                    </p>
                </div>

                <button
                    type="button"
                    className="flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                    <Plus className="size-4" />

                    Add address
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-background p-6">
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <MapPin className="size-5" />
                        </div>

                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Default
                        </span>
                    </div>

                    <h2 className="font-semibold">Home</h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Kuwait City, Al Asimah
                        <br />
                        Block 4, Street 12, Building 25
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Addresses;
