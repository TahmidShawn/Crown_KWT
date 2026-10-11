import { useEffect, useRef, useState } from "react";

/**
 * Measures the pixel width of an element (and keeps it in sync on resize).
 *
 * Google Identity Services renders its sign-in button inside a cross-origin
 * iframe at an exact pixel width. We can't stretch the button from outside the
 * iframe, so we measure our own container and hand that width to <GoogleLogin>
 * to make the button match the surrounding inputs exactly.
 */
const useElementWidth = () => {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Seed with the current width so the button is correct on first paint.
        setWidth(element.offsetWidth);

        if (typeof ResizeObserver === "undefined") {
            const handleResize = () => setWidth(element.offsetWidth);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // offsetWidth gives the layout width (excludes transforms).
                setWidth(entry.target.offsetWidth);
            }
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return { ref, width };
};

export default useElementWidth;
