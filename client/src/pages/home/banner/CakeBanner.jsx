import { useEffect, useState } from "react";
import { Cake } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const cakes = [
    {
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "800+ reviews",
    },
    {
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "620+ reviews",
    },
    {
        image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1200&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "910+ reviews",
    },
    {
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "730+ reviews",
    },
    {
        image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=1200&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "680+ reviews",
    },
    {
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "850+ reviews",
    },
    {
        image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=1200&auto=format&fit=crop&q=80",
        rating: "5.0",
        reviews: "470+ reviews",
    },
];

const CakeBanner = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % cakes.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const activeCake = cakes[activeIndex];

    return (
        <section className="relative overflow-hidden bg-background pb-14 pt-24">
            <div className="wrapper flex flex-col items-center gap-10 md:flex-row md:gap-12 lg:gap-16">
                {/* Content */}
                <div className="relative z-10 w-full max-w-xl md:w-[46%]">
                    {/* Eyebrow */}
                    <div className="mb-4 inline-flex items-center gap-2 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-primary ">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {t.banner.eyebrow}
                    </div>

                    {/* Heading */}
                    <h1 className="text-[2.15rem] leading-[1.06] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.45rem]">
                        {t.banner.title}

                        <span className="mt-1 block">
                            <span className="text-primary">
                                {t.banner.highlight}
                            </span>{" "}
                            <span className="relative inline-block">
                                {t.banner.ending}

                                <span className="absolute -bottom-1 inset-s-0 h-1 w-full rounded-full bg-primary/40" />
                            </span>
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base md:mt-6 md:text-lg md:leading-8">
                        {t.banner.descriptionStart}{" "}
                        <strong className="font-semibold text-foreground">
                            {t.banner.butter}
                        </strong>
                        , {t.banner.descriptionMiddle}{" "}
                        <span className="font-semibold text-primary">
                            {t.banner.birthdays}
                        </span>{" "}
                        {t.banner.descriptionEnd}
                    </p>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
                        <Button
                            asChild
                            variant="asymmetric"
                            size="lg"
                            className="px-7 shadow-lg shadow-primary/20"
                        >
                            <Link to="/">
                                {t.banner.order}
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline-asymmetric"
                            size="lg"
                            className="bg-card px-7 text-foreground"
                        >
                            <Link to="/">
                                {t.banner.menu}
                            </Link>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 flex items-center gap-5 text-xs text-muted-foreground sm:gap-7 sm:text-sm">
                        <div>
                            <p className="text-xl font-semibold text-foreground sm:text-2xl">
                                12k+
                            </p>

                            <p className="mt-0.5">{t.banner.cakesBaked}</p>
                        </div>

                        <div className="h-9 w-px bg-border" />

                        <div>
                            <p className="text-xl font-semibold text-foreground sm:text-2xl">
                                4.9
                            </p>

                            <p className="mt-0.5">{t.banner.averageRating}</p>
                        </div>

                        <div className="hidden h-9 w-px bg-border sm:block" />

                        <div className="hidden sm:block">
                            <p className="font-semibold text-foreground">
                                {t.banner.sameDay}
                            </p>

                            <p className="mt-0.5">
                                {t.banner.deliveryAvailable}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual */}
                <div className="relative w-full max-w-lg md:w-[54%] md:max-w-none">
                    {/* Main image */}
                    <div className="relative aspect-5/4 w-full overflow-hidden   bg-secondary shadow-xl rounded-tl-[100px] rounded-br-[100px]">
                        {cakes.map((cake, index) => (
                            <img
                                key={cake.image}
                                src={cake.image}
                                alt={`${t.banner.cakeDesign} ${index + 1}`}
                                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                                    index === activeIndex
                                        ? "opacity-100"
                                        : "opacity-0"
                                }`}
                            />
                        ))}

                        <div className="absolute inset-0 bg-linear-to-t from-foreground/20 via-transparent to-transparent" />

                        {/* Rating */}
                        <div className="absolute inset-e-3 top-5 z-20 flex items-center gap-2 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-3.5 py-2.5 shadow-lg sm:inset-e-5 sm:top-7">
                            <span className="text-sm tracking-wide text-primary">
                                ★★★★★
                            </span>

                            <span className="text-[10px] font-medium text-muted-foreground transition-opacity duration-500 sm:text-xs">
                                {activeCake.rating} ({activeCake.reviews})
                            </span>
                        </div>
                    </div>

                    {/* Order card */}
                    <div className="absolute -bottom-4 inset-s-3 z-20 flex items-center gap-2.5 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-3 py-2.5 shadow-lg sm:bottom-5 sm:inset-s-5 sm:px-4 sm:py-3 md:-inset-s-6">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                            <Cake className="h-4 w-4 text-primary" />
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold text-card-foreground sm:text-xs">
                                {t.banner.orderConfirmed}
                            </p>

                            <p className="mt-0.5 text-[9px] text-muted-foreground sm:text-[10px]">
                                {t.banner.readyIn}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CakeBanner;
