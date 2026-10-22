import { ArrowUp, Mail } from "lucide-react";
import { Link } from "react-router";

import { useLanguage } from "@/context/LanguageContext";
import cwtLogo from "@/assets/cwt-logo.jpg";
import {
    CONTACT_EMAIL,
    WHATSAPP_LINK,
    WHATSAPP_NUMBER,
} from "@/config/contact";

const Footer = () => {
    const { language } = useLanguage();

    const isArabic = language === "ar";

    const shopLinks = [
        { to: "/", labelEn: "Home", labelAr: "الرئيسية" },
        { to: "/order-tracking", labelEn: "Track order", labelAr: "تتبع الطلب" },
        { to: "/cart", labelEn: "My cart", labelAr: "سلة التسوق" },
    ];

    const accountLinks = [
        { to: "/auth/login", labelEn: "Login", labelAr: "تسجيل الدخول" },
        { to: "/auth/register", labelEn: "Register", labelAr: "حساب جديد" },
        { to: "/dashboard/orders", labelEn: "My orders", labelAr: "طلباتي" },
    ];

    const linkClass =
        "group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-primary";

    const headingClass =
        "text-xs font-bold uppercase tracking-widest text-foreground/80";

    return (
        <footer className="relative overflow-hidden border-t border-border bg-gradient-to-b from-secondary/40 via-secondary/20 to-background">
            
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 start-1/4 size-72 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="wrapper relative">
                
                <div className="grid gap-10 py-12 sm:grid-cols-2 md:py-14 lg:grid-cols-4">
                    
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2.5">
                            <img
                                src={cwtLogo}
                                alt="Crown Kwt logo"
                                className="size-11 rounded-none rounded-tl-xl rounded-br-xl object-cover shadow-sm ring-1 ring-border"
                            />

                            <span className="leading-tight">
                                <span className="block text-lg font-black tracking-tight text-foreground">
                                    Crown Kwt
                                </span>
                                <span className="block text-[11px] font-medium uppercase tracking-widest text-primary">
                                    {isArabic
                                        ? "حلويات الكويت"
                                        : "Kuwait Sweets"}
                                </span>
                            </span>
                        </Link>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "كعكات مصنوعة بعناية لكل لحظة مميزة. اكتشف نكهاتك المفضلة واستمتع بتوصيل موثوق في الكويت."
                                : "Beautifully crafted cakes for every special moment. Discover your favourite flavours with reliable delivery across Kuwait."}
                        </p>
                    </div>

                    
                    <nav>
                        <h3 className={headingClass}>
                            {isArabic ? "تسوق" : "Shop"}
                        </h3>

                        <ul className="mt-4 space-y-2.5">
                            {shopLinks.map((link) => (
                                <li key={link.labelEn}>
                                    <Link to={link.to} className={linkClass}>
                                        <span className="h-px w-3 bg-border transition-all group-hover:w-5 group-hover:bg-primary" />
                                        {isArabic ? link.labelAr : link.labelEn}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    
                    <nav>
                        <h3 className={headingClass}>
                            {isArabic ? "حسابي" : "My account"}
                        </h3>

                        <ul className="mt-4 space-y-2.5">
                            {accountLinks.map((link) => (
                                <li key={link.labelEn}>
                                    <Link to={link.to} className={linkClass}>
                                        <span className="h-px w-3 bg-border transition-all group-hover:w-5 group-hover:bg-primary" />
                                        {isArabic ? link.labelAr : link.labelEn}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    
                    <div className="lg:justify-self-end">
                        <h3 className={headingClass}>
                            {isArabic ? "تواصل معنا" : "Get in touch"}
                        </h3>

                        <div className="mt-4 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card p-4 shadow-sm">
                            <div className="space-y-3">
                                <a
                                    href={WHATSAPP_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-none rounded-tl-xl rounded-br-xl bg-[#25D366] text-white transition-transform group-hover:scale-105">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="size-4"
                                            aria-hidden="true"
                                        >
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.58 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                                        </svg>
                                    </span>

                                    <span className="min-w-0">
                                        <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                            WhatsApp
                                        </span>
                                        <span
                                            dir="ltr"
                                            className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary"
                                        >
                                            +{WHATSAPP_NUMBER}
                                        </span>
                                    </span>
                                </a>

                                <div className="h-px bg-border" />

                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="group flex items-center gap-3"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-none rounded-tl-xl rounded-br-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                                        <Mail className="size-4" />
                                    </span>

                                    <span className="min-w-0">
                                        <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                            Email
                                        </span>
                                        <span className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                                            {CONTACT_EMAIL}
                                        </span>
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="flex flex-col gap-3 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} Crown Kwt.{" "}
                        {isArabic
                            ? "جميع الحقوق محفوظة."
                            : "All rights reserved."}
                    </p>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/privacy"
                            className="transition-colors hover:text-primary"
                        >
                            {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
                        </Link>

                        <span aria-hidden="true" className="text-border">
                            |
                        </span>

                        <Link
                            to="/terms"
                            className="transition-colors hover:text-primary"
                        >
                            {isArabic ? "الشروط والأحكام" : "Terms"}
                        </Link>

                        <Link
                            to="/order-tracking"
                            className="rounded-full border border-border bg-card px-3 py-1.5 transition-colors hover:border-primary/40 hover:text-primary"
                        >
                            {isArabic ? "تتبع الطلب" : "Track order"}
                        </Link>

                        <button
                            type="button"
                            onClick={() =>
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                })
                            }
                            aria-label={
                                isArabic ? "العودة للأعلى" : "Back to top"
                            }
                            title={isArabic ? "العودة للأعلى" : "Back to top"}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-none rounded-tl-lg rounded-br-lg bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
                        >
                            <ArrowUp className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
