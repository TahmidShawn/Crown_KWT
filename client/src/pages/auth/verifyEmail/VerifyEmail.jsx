import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowUpRight, MailCheck } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePost from "@/hooks/usePost";
import useAuth from "@/hooks/useAuth";

const verificationSchema = z.object({
    code: z.string().length(6, "Please enter the 6-digit verification code."),
});

const VerifyEmail = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);

    const inputRefs = useRef([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser } = useAuth();

    const email = location.state?.email || "";

    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(verificationSchema),
        defaultValues: {
            code: "",
        },
    });

    const {
        mutate: verifyEmail,
        isPending: isVerifying,
        error: verifyError,
    } = usePost({
        url: "/auth/verify-email",
    });

    const {
        mutate: resendVerification,
        isPending: isResending,
        error: resendError,
    } = usePost({
        url: "/auth/resend-verification",
    });

    const updateCode = (newCode) => {
        setCode(newCode);

        setValue("code", newCode.join(""), {
            shouldValidate: true,
        });
    };

    const handleChange = (value, index) => {
        const digit = value.replace(/\D/g, "").slice(-1);

        const newCode = [...code];
        newCode[index] = digit;

        updateCode(newCode);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (event, index) => {
        if (event.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();

        const pastedCode = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedCode) return;

        const newCode = ["", "", "", "", "", ""];

        pastedCode.split("").forEach((digit, index) => {
            newCode[index] = digit;
        });

        updateCode(newCode);

        const nextIndex = Math.min(pastedCode.length, 5);

        inputRefs.current[nextIndex]?.focus();
    };

    const handleVerify = (formData) => {
        if (!email) return;

        verifyEmail(
            {
                email,
                code: formData.code,
            },
            {
                onSuccess: async () => {
                    await refreshUser();
                    navigate("/");
                },
            },
        );
    };

    const handleResend = () => {
        if (!email || isResending) return;

        resendVerification({
            email,
        });
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="flex min-h-screen items-center justify-center px-5 py-12">
                <section className="w-full max-w-md">

                    <div className="mb-8">
                        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <MailCheck className="size-6" />
                        </div>

                        <p className="mb-2 text-sm font-semibold text-primary">
                            Almost there
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Verify your email
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            We’ve sent a 6-digit verification code to{" "}
                            {email ? (
                                <span className="font-medium text-foreground">
                                    {email}
                                </span>
                            ) : (
                                "your email address"
                            )}
                            . Enter the code below to complete your
                            registration.
                        </p>
                    </div>

                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(handleVerify)}
                        noValidate
                    >

                        <div className="space-y-3">
                            <label
                                htmlFor="verification-code-0"
                                className="text-sm font-medium text-foreground"
                            >
                                Verification code
                            </label>

                            <div
                                className="flex gap-2 sm:gap-3"
                                onPaste={handlePaste}
                            >
                                {code.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(element) => {
                                            inputRefs.current[index] = element;
                                        }}
                                        id={`verification-code-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete={
                                            index === 0
                                                ? "one-time-code"
                                                : "off"
                                        }
                                        maxLength={1}
                                        value={digit}
                                        onChange={(event) =>
                                            handleChange(
                                                event.target.value,
                                                index,
                                            )
                                        }
                                        onKeyDown={(event) =>
                                            handleKeyDown(event, index)
                                        }
                                        className="h-14 w-full rounded-xl border-border text-center text-xl font-semibold shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                ))}
                            </div>

                            {errors.code && (
                                <p className="text-sm text-destructive">
                                    {errors.code.message}
                                </p>
                            )}
                        </div>

                        {verifyError && (
                            <p className="text-sm text-destructive">
                                {verifyError?.response?.data?.message ||
                                    "Unable to verify your email. Please try again."}
                            </p>
                        )}

                        <Button
                            type="submit"
                            variant="asymmetric"
                            size="lg"
                            disabled={isVerifying || !email}
                            className="group/button h-auto w-full gap-2 px-6 py-2 text-sm font-semibold"
                        >
                            {isVerifying ? "Verifying..." : "Verify email"}

                            {!isVerifying && (
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform duration-300 group-hover/button:rotate-45">
                                    <ArrowUpRight className="size-3.5" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-7 text-center text-sm text-muted-foreground">
                        <span>Didn't receive the code? </span>

                        <button
                            type="button"
                            disabled={isResending || !email}
                            onClick={handleResend}
                            className="font-semibold text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isResending ? "Sending..." : "Resend code"}
                        </button>

                        {resendError && (
                            <p className="mt-2 text-sm text-destructive">
                                {resendError?.response?.data?.message ||
                                    "Unable to resend the verification code."}
                            </p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link
                            to="/auth/register"
                            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                            Back to registration
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default VerifyEmail;
