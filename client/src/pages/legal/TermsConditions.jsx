import { Link } from "react-router";
import {
    Banknote,
    Mail,
    PackageCheck,
    RotateCcw,
    ShoppingBag,
    Truck,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { CONTACT_EMAIL } from "@/config/contact";

const sections = [
    {
        id: "ordering",
        icon: ShoppingBag,
        titleEn: "1. Ordering & availability",
        titleAr: "1. الطلب والتوفر",
        bodyEn: [
            "All cakes are subject to availability. If an item in your order becomes unavailable, we will contact you with a replacement or refund option.",
            "Please double-check your delivery address, phone number and any cake message or special instructions before placing your order.",
            "Custom designs may need extra preparation time — we will confirm the delivery date with you after checkout.",
        ],
        bodyAr: [
            "جميع الكعكات تخضع للتوفر. إذا أصبح أي صنف غير متوفر سنتصل بك لاقتراح بديل أو استرداد المبلغ.",
            "يرجى التأكد من عنوان التوصيل ورقم الهاتف وأي رسالة على الكعكة أو ملاحظات خاصة قبل إتمام الطلب.",
            "التصاميم المخصصة قد تحتاج وقت تحضير إضافي — سنؤكد معك موعد التوصيل بعد إتمام الشراء.",
        ],
    },
    {
        id: "payment",
        icon: Banknote,
        titleEn: "2. Payment",
        titleAr: "2. الدفع",
        bodyEn: [
            "We accept secure online payment and cash on delivery across Kuwait.",
            "Online orders are confirmed only after payment succeeds. If payment fails or expires, the order is cancelled automatically and reserved stock is released.",
            "All prices are shown in Kuwaiti Dinar (KWD) and include applicable charges shown at checkout.",
        ],
        bodyAr: [
            "نقبل الدفع الإلكتروني الآمن والدفع نقدًا عند الاستلام في جميع أنحاء الكويت.",
            "يتم تأكيد الطلبات الإلكترونية فقط بعد نجاح الدفع. إذا فشل الدفع أو انتهت مهلته يُلغى الطلب تلقائيًا.",
            "جميع الأسعار بالدينار الكويتي وتشمل الرسوم الموضحة عند إتمام الشراء.",
        ],
    },
    {
        id: "delivery",
        icon: Truck,
        titleEn: "3. Delivery",
        titleAr: "3. التوصيل",
        bodyEn: [
            "We deliver across all Kuwait governorates. Delivery fees and time windows are shown at checkout.",
            "Please keep your phone reachable on delivery day so our driver can reach you quickly.",
            "Cakes are delicate — please check your order on arrival and report any damage the same day so we can help.",
        ],
        bodyAr: [
            "نوصل لجميع محافظات الكويت. تظهر رسوم التوصيل وأوقاته عند إتمام الشراء.",
            "يرجى إبقاء هاتفك متاحًا يوم التوصيل ليتمكن السائق من الوصول إليك بسرعة.",
            "الكعكات حساسة — يرجى فحص طلبك عند الاستلام والإبلاغ عن أي ضرر في نفس اليوم لنتمكن من مساعدتك.",
        ],
    },
    {
        id: "cancellation",
        icon: RotateCcw,
        titleEn: "4. Cancellation & refunds",
        titleAr: "4. الإلغاء والاسترداد",
        bodyEn: [
            "Because our cakes are baked fresh to order, cancellations are accepted before preparation starts — contact us as early as possible.",
            "If we cannot fulfil your order, you receive a full refund to the original payment method.",
            "Refund timing for online payments depends on your bank, typically within 5–14 business days.",
        ],
        bodyAr: [
            "لأن كعكاتنا تُخبز طازجة عند الطلب، يُقبل الإلغاء قبل بدء التحضير — تواصل معنا في أقرب وقت ممكن.",
            "إذا تعذر علينا تنفيذ طلبك تحصل على استرداد كامل لنفس وسيلة الدفع.",
            "مدة وصول المبلغ المسترد لمدفوعات الإنترنت تعتمد على البنك، عادة خلال 5–14 يوم عمل.",
        ],
    },
    {
        id: "quality",
        icon: PackageCheck,
        titleEn: "5. Quality promise",
        titleAr: "5. وعد الجودة",
        bodyEn: [
            "Every cake is baked with real ingredients and finished by hand. Photos are illustrative — handmade decoration may vary slightly.",
            "Store cakes as instructed (usually refrigerated) and enjoy within the recommended time for the best taste.",
        ],
        bodyAr: [
            "كل كعكة تُخبز بمكونات حقيقية وتُجهز يدويًا. الصور توضيحية — قد تختلف الزخارف اليدوية قليلًا.",
            "احفظ الكعكة حسب التعليمات (عادة في الثلاجة) واستمتع بها خلال المدة الموصى بها لأفضل طعم.",
        ],
    },
];

const TermsConditions = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    return (
        <main className="wrapper py-10 md:py-14">
            <div className="mx-auto max-w-3xl">
                <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                    {isArabic ? "الشروط" : "Terms"}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                    {isArabic ? "الشروط والأحكام" : "Terms & Conditions"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {isArabic
                        ? "آخر تحديث: 2026 — باستخدامك متجر Crown Kwt فأنت توافق على الشروط التالية الخاصة بالطلب والدفع والتوصيل."
                        : "Last updated: 2026 — by shopping with Crown Kwt you agree to the following terms on ordering, payment and delivery."}
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
                                {isArabic ? "6. تواصل معنا" : "6. Contact us"}
                            </h2>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "لأي سؤال حول طلبك أو هذه الشروط راسلنا على:"
                                : "For any question about your order or these terms, email us at:"}
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
                        to="/privacy"
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                    >
                        {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
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

export default TermsConditions;
