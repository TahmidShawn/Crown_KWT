import { useEffect } from "react";
import { useLocation } from "react-router";

/*
 * Scroll restoration: every time the URL pathname changes (user clicks a
 * link to a new page), jump back to the top. Without this, React Router
 * keeps the old scroll position, so a new page opens scrolled halfway down.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
