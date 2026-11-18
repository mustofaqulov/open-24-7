"use client";
import { Select } from "./select";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";
import Link from "next/link";
import { ArrowUpRight, MapPin, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "./locale";
import { redesignCopy } from "@/lib/redesign-copy";

export function SiteHeader() {
  const { locale, setLocale, t } = useT();
  const c = redesignCopy[locale];
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenu(false);
        trigger.current?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setMenu(false);
    }
    if (menu) {
      document.addEventListener("keydown", dismiss);
      document.addEventListener("pointerdown", outside);
    }
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
    };
  }, [menu]);
  const links = [
    ["/explore", t.explore],
    ["/#how", t.howItWorks],
    ["/about", t.about],
    ["/business", t.business],
    ["/#faq", c.faqLabel],
    ["/contact", t.contact],
    ["/login", t.signIn],
  ];
  return (
    <header className="site-header" ref={header}>
      <a className="skip-link" href="#main">
        {t.mainNavigation} →
      </a>
      <div className="container nav">
        <Link className="nav-location" href="/explore" aria-label={t.nearbyPlaces}>
          <MapPin size={21} aria-hidden="true" />
        </Link>
        <Link
          className="brand"
          href="/"
          aria-label={`Open24 ${t.home}`}
          onClick={() => setMenu(false)}
        >
          <Wordmark />
        </Link>
        <span className="nav-tagline">{c.local}</span>
        <div className="nav-actions">
          <label className="sr-only" htmlFor="locale">
            {t.language}
          </label>
          <Select
            id="locale"
            className="lang-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value as typeof locale)}
          >
            <option value="uz">UZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </Select>
          <ThemeToggle />
          <Link className="nav-signin" href="/login">
            {t.signIn}
          </Link>
          <Link className="button button-small nav-help" href="/contact">
            {c.help}
            <ArrowUpRight size={16} />
          </Link>
          <button
            className="menu-button"
            type="button"
            ref={trigger}
            aria-label={t.toggleMenu}
            aria-controls="main-navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <span>{menu ? c.close : c.menu}</span>
            {menu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        <nav
          id="main-navigation"
          className={menu ? "nav-links open" : "nav-links"}
          aria-label={t.mainNavigation}
          hidden={!menu}
        >
          <div className="nav-preferences">
            <label className="sr-only" htmlFor="locale-menu">
              {t.language}
            </label>
            <Select
              id="locale-menu"
              className="lang-select"
              value={locale}
              onChange={(e) => setLocale(e.target.value as typeof locale)}
            >
              <option value="uz">UZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </Select>
            <ThemeToggle />
          </div>
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <span>{label}</span>
              <ArrowUpRight size={18} />
            </Link>
          ))}
          <Link
            className="nav-account"
            href="/signup"
            onClick={() => setMenu(false)}
          >
            {t.signUp}
            <ArrowUpRight size={18} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
