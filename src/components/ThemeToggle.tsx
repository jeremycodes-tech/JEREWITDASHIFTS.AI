import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 
                 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 
                 transition-colors"
      title="Toggle dark mode"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-gray-700" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
}
