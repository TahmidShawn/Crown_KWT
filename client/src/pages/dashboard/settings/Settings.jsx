import { Bell, Lock, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
    const [notifications, setNotifications] = useState(true);
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [promotions, setPromotions] = useState(false);

    return (
        <div className="p-5 sm:p-7 lg:p-9">
            <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-primary">
                    Account
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Settings
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Manage your account preferences and notification settings.
                </p>
            </div>

            <div className="max-w-2xl space-y-5">
                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between gap-5 p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Bell className="size-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Notifications
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                        Receive important updates about your
                                        account and orders.
                                    </p>
                                </div>
                            </div>

                            <Switch
                                checked={notifications}
                                onCheckedChange={setNotifications}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between gap-5 p-5 sm:p-6">
                            <div>
                                <h3 className="text-sm font-medium">
                                    Order updates
                                </h3>

                                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                    Get notified when your order status changes.
                                </p>
                            </div>

                            <Switch
                                checked={orderUpdates}
                                onCheckedChange={setOrderUpdates}
                                disabled={!notifications}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between gap-5 p-5 sm:p-6">
                            <div>
                                <h3 className="text-sm font-medium">
                                    Offers and promotions
                                </h3>

                                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                    Receive updates about new cakes and special
                                    offers.
                                </p>
                            </div>

                            <Switch
                                checked={promotions}
                                onCheckedChange={setPromotions}
                                disabled={!notifications}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Lock className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">Security</h2>

                                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                    Keep your Crown Kwt account secure.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-5" />

                        <button
                            type="button"
                            className="flex w-full items-center justify-between gap-4 text-left"
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    Change password
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Update your account password.
                                </p>
                            </div>

                            <span className="shrink-0 text-sm font-semibold text-primary">
                                Change
                            </span>
                        </button>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <SettingsIcon className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Account preferences
                                </h2>

                                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                    Manage your general account preferences.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-5" />

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Language
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Choose your preferred language.
                                </p>
                            </div>

                            <span className="text-sm font-medium">
                                English
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
