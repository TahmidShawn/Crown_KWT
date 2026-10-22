import { useNavigate, useSearchParams } from "react-router";
import { ChevronRight, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import usePost from "@/hooks/usePost";
import { PageTitle } from "@/components/shared/PageTitle";

const PaymentFailed = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const orderId = searchParams.get("orderId");

    const { mutate: createPayment, isPending: isCreatingPayment } = usePost({
        url: "/payments",
    });

    const handleRetryPayment = () => {
        createPayment(
            { orderId },
            {
                onSuccess: (response) => {
                    const paymentUrl = response?.data?.paymentUrl;

                    if (!paymentUrl) {
                        toast.error(
                            "Payment link is missing. Please try again.",
                        );
                        return;
                    }

                    window.location.href = paymentUrl;
                },

                onError: (error) => {
                    const message =
                        error?.response?.data?.message ||
                        "Unable to restart payment. Please try again.";

                    toast.error(message);
                },
            },
        );
    };

    return (
        <>
            <PageTitle title="Payment Failed" />
            <main className="wrapper py-10 md:py-14">
            <div className="mx-auto max-w-2xl border border-border bg-card p-8 text-center md:p-12">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <X className="size-8" />
                </div>

                <p className="mb-2 text-sm font-semibold tracking-wider text-destructive uppercase">
                    Payment failed
                </p>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    We couldn't complete your payment
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                    Your payment was not completed, so your order is not
                    confirmed yet. You can try paying again. If money was
                    deducted from your account, please contact us.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 md:flex-row">
                    {orderId && (
                        <Button
                            variant="asymmetric"
                            size="lg"
                            disabled={isCreatingPayment}
                            onClick={handleRetryPayment}
                        >
                            <RotateCcw className="size-4" />
                            {isCreatingPayment
                                ? "Redirecting to payment..."
                                : "Try payment again"}
                        </Button>
                    )}

                    <Button
                        variant="outline-asymmetric"
                        size="lg"
                        onClick={() => navigate("/cart")}
                    >
                        Back to cart
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </main>
        </>
    );
};

export default PaymentFailed;
