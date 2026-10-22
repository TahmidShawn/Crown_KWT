import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import useGet from "@/hooks/useGet";
import { PageTitle } from "@/components/shared/PageTitle";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    const orderId = searchParams.get("orderId");


    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
    }, [queryClient]);

    const { data: orderResponse } = useGet({
        url: `/order/${orderId}`,
        queryKey: ["order", orderId],
        retry: false,
        enabled: Boolean(orderId),
    });

    const orderNumber = orderResponse?.data?.orderNumber;

    return (
        <>
            <PageTitle title="Order Confirmed" />
            <main className="wrapper py-10 md:py-14">
            <div className="mx-auto max-w-2xl border border-border bg-card p-8 text-center md:p-12">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-8" />
                </div>

                <p className="mb-2 text-sm font-semibold tracking-wider text-primary uppercase">
                    Payment successful
                </p>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Thank you, your order is confirmed
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                    We received your payment and started preparing your order.
                    You can follow its progress from your orders page.
                </p>

                {orderNumber && (
                    <div className="mt-6 border border-border bg-background p-4">
                        <p className="text-xs text-muted-foreground">
                            Order number
                        </p>

                        <p className="mt-1 font-semibold">{orderNumber}</p>
                    </div>
                )}

                <div className="mt-8 flex flex-col justify-center gap-3 md:flex-row">
                    <Button
                        variant="asymmetric"
                        size="lg"
                        onClick={() => navigate("/")}
                    >
                        Continue shopping
                    </Button>

                    <Button
                        variant="outline-asymmetric"
                        size="lg"
                        onClick={() => navigate("/dashboard/orders")}
                    >
                        View orders
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </main>
        </>
    );
};

export default PaymentSuccess;
