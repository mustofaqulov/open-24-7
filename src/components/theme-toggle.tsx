"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "./locale";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const { locale } = useT();
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("open24-theme");
      } catch {}
      const next = saved === "dark" || (saved !== "light" && media.matches);
      document.documentElement.dataset.theme = next ? "dark" : "light";
      setDark(next);
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const label =
    locale === "uz"
      ? "Tungi rejim"
      : locale === "ru"
        ? "Тёмная тема"
        : "Dark mode";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      aria-pressed={dark}
      title={label}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.dataset.theme = next ? "dark" : "light";
        try {
          localStorage.setItem("open24-theme", next ? "dark" : "light");
        } catch {}
      }}
    >
      <Sun className="theme-sun" size={18} />
      <Moon className="theme-moon" size={18} />
    </button>
  );
}
