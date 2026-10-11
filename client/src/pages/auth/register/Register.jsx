import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    ArrowUpRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    User,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/ui/google-icon";
import { Input } from "@/components/ui/input";
import usePost from "@/hooks/usePost";
import useAuth from "@/hooks/useAuth";
import useElementWidth from "@/hooks/useElementWidth";

const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(4, "Name should have more than 4 characters.")
        .max(30, "Name cannot exceed 30 characters."),

    email: z.string().trim().email("Please enter a valid email address."),

    password: z.string().min(8, "Password must be at least 8 characters long."),
});

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { ref: googleBtnRef, width: googleBtnWidth } = useElementWidth();

    const navigate = useNavigate();

    const { refreshUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    const {
        mutate: registerUser,
        isPending: isRegisterPending,
        error: registerError,
    } = usePost({
        url: "/auth/register",
    });

    const {
        mutate: googleLogin,
        isPending: isGooglePending,
        error: googleError,
    } = usePost({
        url: "/auth/google",
    });

    const isPending = isRegisterPending || isGooglePending;

    const handleRegister = (formData) => {
        registerUser(formData, {
            onSuccess: () => {
                navigate("/auth/verify-email", {
                    state: {
                        email: formData.email,
                    },
                });
            },
        });
    };

    const handleGoogleSuccess = (credentialResponse) => {
        if (!credentialResponse.credential) {
            return;
        }

        googleLogin(
            {
                credential: credentialResponse.credential,
            },
            {
                onSuccess: async () => {
                    await refreshUser();

                    navigate("/");
                },
            },
        );
    };

    const handleGoogleError = () => {
        console.error("Google Sign-In failed");
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="flex min-h-screen">
                <section className="relative hidden min-h-screen w-1/2 overflow-hidden md:block">
                    <img
                        src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&auto=format&fit=crop&q=90"
                        alt="Beautiful celebration cake"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/10" />

                    <div className="absolute right-6 top-6 z-10">
                        <Button
                            asChild
                            variant="outline-asymmetric"
                            size="lg"
                            className="group/button gap-2 border-white/70 bg-white/90 px-6 py-2 text-sm font-semibold text-foreground shadow-lg backdrop-blur-sm hover:bg-white"
                        >
                            <Link to="/" className="flex items-center gap-2">
                                Home
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover/button:-rotate-45">
                                    <ArrowLeft className="size-3.5" />
                                </span>
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="flex min-h-screen w-full items-center justify-center px-5 py-10 md:w-1/2 md:px-4 lg:px-6">
                    <div className="w-full max-w-lg">
                        <div className="mb-8 md:hidden">
                            <Button
                                asChild
                                variant="outline-asymmetric"
                                size="lg"
                                className="group/button gap-2 px-6 py-2 text-sm font-semibold"
                            >
                                <Link
                                    to="/"
                                    className="flex items-center gap-2"
                                >
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover/button:-rotate-45">
                                        <ArrowLeft className="size-3.5" />
                                    </span>
                                    Home
                                </Link>
                            </Button>
                        </div>

                        <div className="mb-7">
                            <p className="mb-2 text-sm font-semibold text-primary">
                                Welcome to Crown Kwt
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Create your account
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Sign up to order your favorite cakes and manage
                                your orders easily.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/*
                             * Custom "Continue with Google" button that matches the
                             * form inputs exactly. The real <GoogleLogin> is layered
                             * invisibly on top so it still handles the click and runs
                             * Google's ID-token flow (backend stays unchanged).
                             */}
                            <div
                                className="relative h-11 w-full"
                                ref={googleBtnRef}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    aria-label="Continue with Google"
                                    disabled={isPending}
                                    className="pointer-events-none absolute inset-0 h-11 w-full gap-2.5 rounded-lg text-sm font-medium"
                                >
                                    <GoogleIcon className="size-[18px]" />
                                    Continue with Google
                                </Button>

                                {googleBtnWidth > 0 && (
                                    <div className="google-login-overlay absolute inset-0">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={handleGoogleError}
                                            useOneTap={false}
                                            theme="outline"
                                            size="large"
                                            text="continue_with"
                                            shape="rectangular"
                                            width={googleBtnWidth}
                                            disabled={isPending}
                                        />
                                    </div>
                                )}
                            </div>

                            {googleError && (
                                <p className="text-center text-sm text-destructive">
                                    {googleError?.response?.data?.message ||
                                        "Unable to continue with Google. Please try again."}
                                </p>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-border" />

                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Or continue with email
                                </span>

                                <div className="h-px flex-1 bg-border" />
                            </div>
                        </div>

                        <form
                            className="mt-5 space-y-5"
                            onSubmit={handleSubmit(handleRegister)}
                            noValidate
                        >
                            <div className="space-y-2">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Full name
                                </label>

                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your full name"
                                        disabled={isPending}
                                        className="h-11 pl-10"
                                        {...register("username")}
                                    />
                                </div>

                                {errors.username && (
                                    <p className="text-sm text-destructive">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        disabled={isPending}
                                        className="h-11 pl-10"
                                        {...register("email")}
                                    />
                                </div>

                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        disabled={isPending}
                                        className="h-11 px-10"
                                        {...register("password")}
                                    />

                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {registerError && (
                                <p className="text-sm text-destructive">
                                    {registerError?.response?.data?.message ||
                                        "Unable to create your account. Please try again."}
                                </p>
                            )}

                            <Button
                                type="submit"
                                variant="asymmetric"
                                size="lg"
                                disabled={isPending}
                                className="group/button h-auto w-full gap-2 px-6 py-2 text-sm font-semibold"
                            >
                                {isRegisterPending
                                    ? "Creating account..."
                                    : "Create account"}

                                {!isRegisterPending && (
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform duration-300 group-hover/button:rotate-45">
                                        <ArrowUpRight className="size-3.5" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                to="/auth/login"
                                className="font-semibold text-primary hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Register;
