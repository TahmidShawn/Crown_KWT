import { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    ZoomIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const ProductGallery = ({ product }) => {
    const [activeImage, setActiveImage] = useState(0);
    const [liked, setLiked] = useState(false);

    const images = product.images;

    const previousImage = () => {
        setActiveImage((current) =>
            current === 0 ? images.length - 1 : current - 1,
        );
    };

    const nextImage = () => {
        setActiveImage((current) =>
            current === images.length - 1 ? 0 : current + 1,
        );
    };

    return (
        <div className="flex flex-col gap-3 md:flex-row">
            
            <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:w-20 md:flex-col md:overflow-visible">
                {images.map((image, index) => (
                    <button
                        key={image.fileId}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`size-16 shrink-0 overflow-hidden rounded-none rounded-tl-xl rounded-br-xl border-2 transition-all md:size-20 ${
                            activeImage === index
                                ? "border-primary"
                                : "border-border opacity-65 hover:opacity-100"
                        }`}
                    >
                        <img
                            src={image.url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    </button>
                ))}
            </div>

            
            <div className="relative order-1 min-w-0 flex-1 md:order-2">
                <div className="relative aspect-square overflow-hidden rounded-none rounded-tl-3xl rounded-br-3xl bg-secondary">
                    <img
                        src={images[activeImage].url}
                        alt={product.name.en}
                        className="h-full w-full object-cover transition-opacity duration-300"
                    />

                    {product.discountPercentage > 0 && (
                        <span
                            dir="ltr"
                            className="absolute top-4 inset-s-4 rounded-none rounded-tl-xl rounded-br-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
                        >
                            -{product.discountPercentage}%
                        </span>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setLiked((current) => !current)}
                        className="absolute top-4 inset-e-4 rounded-full border-white/50 bg-background/90 backdrop-blur-sm hover:bg-background"
                    >
                        <Heart
                            className={`size-4 ${
                                liked
                                    ? "fill-primary text-primary"
                                    : "text-foreground"
                            }`}
                        />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute bottom-4 inset-e-4 rounded-full border-white/50 bg-background/90 backdrop-blur-sm hover:bg-background"
                    >
                        <ZoomIn className="size-4" />
                    </Button>

                    {images.length > 1 && (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={previousImage}
                                className="absolute top-1/2 inset-s-4 -translate-y-1/2 rounded-full border-white/50 bg-background/90 backdrop-blur-sm hover:bg-background"
                            >
                                <ChevronLeft className="size-4 rtl:rotate-180" />
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={nextImage}
                                className="absolute top-1/2 inset-e-4 -translate-y-1/2 rounded-full border-white/50 bg-background/90 backdrop-blur-sm hover:bg-background"
                            >
                                <ChevronRight className="size-4 rtl:rotate-180" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductGallery;
