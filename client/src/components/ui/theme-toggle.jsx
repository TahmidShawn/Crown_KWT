import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";

export function ThemeToggle() {
    const { toggleTheme, resolvedTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
            {resolvedTheme === "dark" ? (
                <Sun className="size-5" />
            ) : (
                <Moon className="size-5" />
            )}
        </Button>
    );
}
