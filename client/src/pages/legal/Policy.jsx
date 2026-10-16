import { Link } from "react-router";
import { FileText, Mail, ShieldCheck } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { CONTACT_EMAIL } from "@/config/contact";

const sections = [
    {
        id: "information-we-collect",
        icon: FileText,
        titleEn: "1. Information we collect",
        titleAr: "1. المعلومات التي نجمعها",
        bodyEn: [
            "Account details you provide when registering or checking out — your name, email address, phone number and delivery address.",
            "Order details — the cakes and add-ons you purchase, quantities, special instructions and payment method.",
            "Technical details collected automatically — device type, browser, pages visited and approximate location, used only to keep the shop fast and secure.",
        ],
        bodyAr: [
            "بيانات الحساب التي تقدمها عند التسجيل أو إتمام الطلب — الاسم وعنوان البريد الإلكتروني ورقم الهاتف وعنوان التوصيل.",
            "تفاصيل الطلبات — الكعكات والإضافات التي تشتريها والكميات والملاحظات الخاصة وطريقة الدفع.",
            "بيانات تقنية يتم جمعها تلقائيًا — نوع الجهاز والمتصفح والصفحات التي تزورها والموقع التقريبي، وتُستخدم فقط للحفاظ على سرعة المتجر وأمانه.",
        ],
    },
    {
        id: "how-we-use",
        icon: ShieldCheck,
        titleEn: "2. How we use your information",
        titleAr: "2. كيف نستخدم معلوماتك",
        bodyEn: [
            "To process, prepare and deliver your orders, and to send order confirmations and delivery updates.",
            "To provide customer support over WhatsApp or email when you contact us.",
            "To improve our cakes, menu and website experience based on aggregated, non-identifying usage trends.",
            "We never sell your personal data to third parties.",
        ],
        bodyAr: [
            "لمعالجة طلباتك وتجهيزها وتوصيلها، وإرسال تأكيدات الطلب وتحديثات التوصيل.",
            "لتقديم دعم العملاء عبر واتساب أو البريد الإلكتروني عندما تتواصل معنا.",
            "لتحسين الكعكات والقائمة وتجربة الموقع بناءً على اتجاهات استخدام إجمالية غير محددة للهوية.",
            "لا نبيع بياناتك الشخصية لأي طرف ثالث إطلاقًا.",
        ],
    },
];

const Policy = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    return (
        <main className="wrapper py-10 md:py-14">
            <div className="mx-auto max-w-3xl">
                <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                    {isArabic ? "الخصوصية" : "Privacy"}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                    {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {isArabic
                        ? "آخر تحديث: 2026 — توضح هذه الصفحة كيف تجمع Crown Kwt بياناتك وتستخدمها وتحميها عند التسوق معنا."
                        : "Last updated: 2026 — this page explains how Crown Kwt collects, uses and protects your data when you shop with us."}
                </p>

                <div className="mt-8 space-y-4">
                    {sections.map((section) => (
                        <section
                            key={section.id}
                            className="rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-none rounded-tl-xl rounded-br-xl bg-primary/10 text-primary">
                                    <section.icon className="size-5" />
                                </span>
                                <h2 className="text-lg font-bold tracking-tight">
                                    {isArabic ? section.titleAr : section.titleEn}
                                </h2>
                            </div>
                            <ul className="mt-4 space-y-2.5">
                                {(isArabic ? section.bodyAr : section.bodyEn).map(
                                    (line) => (
                                        <li
                                            key={line.slice(0, 24)}
                                            className="flex gap-2.5 text-sm leading-6 text-muted-foreground"
                                        >
                                            <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary" />
                                            {line}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </section>
                    ))}

                    <section className="rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-none rounded-tl-xl rounded-br-xl bg-primary/10 text-primary">
                                <Mail className="size-5" />
                            </span>
                            <h2 className="text-lg font-bold tracking-tight">
                                {isArabic ? "3. تواصل معنا" : "3. Contact us"}
                            </h2>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "لأي سؤال حول بياناتك — الوصول إليها أو تصحيحها أو حذفها — راسلنا على:"
                                : "For any question about your data — accessing, correcting or deleting it — email us at:"}
                        </p>
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                        >
                            {CONTACT_EMAIL}
                        </a>
                    </section>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        to="/terms"
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                    >
                        {isArabic ? "الشروط والأحكام" : "Terms & Conditions"}
                    </Link>
                    <Link
                        to="/order-tracking"
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                    >
                        {isArabic ? "تتبع الطلب" : "Track order"}
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default Policy;
