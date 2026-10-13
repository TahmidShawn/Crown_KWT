import { Check } from "lucide-react";

/*
 * Shared vertical tracking timeline used by the public tracking page, the
 * customer order details page and the admin order details page.
 *
 * Every step always renders its own status icon. Once a step has actually been
 * reached it is marked with a tick plus the orange "done" colour, so customers
 * can tell at a glance what already happened instead of having to infer it from
 * the current status alone. The step matching the live order status keeps a
 * highlighted ring, which answers "where is my order right now".
 */

const COPY = {
    completed: { en: "Completed", ar: "مكتمل" },
    inProgress: { en: "In progress", ar: "قيد التنفيذ" },
    pending: { en: "Pending", ar: "في الانتظار" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
};

/*
 * Colours use the site's semantic `primary` token (the same rust orange as the
 * navbar and buttons) rather than hard-coded Tailwind palette values. That keeps
 * the timeline on-brand and makes it adapt automatically in dark mode, where
 * `primary` is redefined to a lighter tint.
 */
const markerClass = {
    cancelled: "border-destructive bg-destructive/10 text-destructive",
    done: "border-primary bg-primary text-primary-foreground",
    pending: "border-border bg-muted text-muted-foreground",
};

const chipClass = {
    cancelled: "bg-destructive/10 text-destructive",
    done: "bg-primary/10 text-primary",
    pending: "bg-muted text-muted-foreground",
};

const connectorClass = {
    done: "bg-primary",
    cancelled: "bg-destructive/40",
    pending: "bg-border",
};

const OrderTimeline = ({ steps, language = "en" }) => {
    const isArabic = language === "ar";
    const label = (key) => COPY[key][isArabic ? "ar" : "en"];

    return (
        <ol
            className="relative"
            aria-label={
                isArabic ? "مراحل تتبع الطلب" : "Order tracking progress"
            }
        >
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === steps.length - 1;
                const isCancelled = step.key === "cancelled";
                const isCurrent = Boolean(step.current);

                // A step counts as done once the order has reached it, so the
                // final step of a delivered order is marked complete too.
                const isDone = Boolean(step.completed) || isCurrent;

                // The last step is terminal when it is current (a delivered
                // order) — there is nothing left in progress.
                const isTerminal = isLast && isCurrent;

                const state = isCancelled
                    ? "cancelled"
                    : isDone
                      ? "done"
                      : "pending";

                const chipText = isCancelled
                    ? label("cancelled")
                    : isDone
                      ? label("completed")
                      : label("pending");

                return (
                    <li key={step.key} className="relative flex gap-4">
                        {!isLast && (
                            <div
                                aria-hidden="true"
                                className={`absolute top-10 h-[calc(100%-8px)] w-px ${
                                    isArabic ? "right-5" : "left-5"
                                } ${connectorClass[state]}`}
                            />
                        )}

                        <div className="relative z-10 flex size-10 shrink-0 items-center justify-center">
                            <div
                                className={`flex size-10 items-center justify-center rounded-full border-2 ${
                                    markerClass[state]
                                } ${
                                    isCurrent && !isCancelled
                                        ? "ring-4 ring-primary/20"
                                        : ""
                                }`}
                            >
                                {state === "done" ? (
                                    <Check
                                        className="size-5"
                                        strokeWidth={3}
                                    />
                                ) : (
                                    <Icon className="size-4" />
                                )}
                            </div>
                        </div>

                        <div
                            className={`min-w-0 flex-1 ${
                                isLast ? "pb-0" : "pb-8"
                            }`}
                        >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3
                                        className={`text-sm font-semibold ${
                                            state === "pending"
                                                ? "text-muted-foreground"
                                                : "text-foreground"
                                        }`}
                                    >
                                        {step.title}
                                    </h3>

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                            chipClass[state]
                                        }`}
                                    >
                                        {chipText}
                                    </span>
                                </div>

                                {step.date && (
                                    <span className="text-xs text-muted-foreground">
                                        {step.date}
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                {step.description}
                            </p>

                            {isCurrent && !isTerminal && !isCancelled && (
                                <p className="mt-1.5 text-xs font-medium text-primary">
                                    {label("inProgress")}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};

export default OrderTimeline;
