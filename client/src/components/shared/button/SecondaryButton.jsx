import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

const SecondaryButton = ({
    children,
    className = "",
    to,
    href,
    onClick,
    type = "button",
    ...rest
}) => {
    const inner = (
        <>
            {children}
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover/button:rotate-45">
                <ArrowUpRight className="size-3.5" />
            </span>
        </>
    );

    const classes = `gap-2 px-6 py-2 text-sm font-semibold ${className}`;

    if (to) {
        return (
            <Link to={to} onClick={onClick} className="inline-flex" {...rest}>
                <Button
                    type={type}
                    variant="outline-asymmetric"
                    size="lg"
                    className={classes}
                    tabIndex={-1}
                >
                    {inner}
                </Button>
            </Link>
        );
    }

    if (href) {
        return (
            <a href={href} onClick={onClick} className="inline-flex" {...rest}>
                <Button
                    type={type}
                    variant="outline-asymmetric"
                    size="lg"
                    className={classes}
                    tabIndex={-1}
                >
                    {inner}
                </Button>
            </a>
        );
    }

    return (
        <Button
            type={type}
            variant="outline-asymmetric"
            size="lg"
            onClick={onClick}
            className={classes}
            {...rest}
        >
            {inner}
        </Button>
    );
};

export default SecondaryButton;
