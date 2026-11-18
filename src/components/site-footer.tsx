"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "./wordmark";
import { useT } from "./locale";
import { redesignCopy } from "@/lib/redesign-copy";

export function SiteFooter() {
  const { t, locale } = useT();
  const c = redesignCopy[locale];
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" href="/" aria-label="Open24">
              <Wordmark />
            </Link>
            <p>{c.footerText}</p>
            <Link className="footer-contact" href="/contact">
              {c.help}
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="footer-column">
            <h2>{c.discover}</h2>
            <Link href="/explore">{t.explore}</Link>
            <Link href="/explore?openNow=true">{t.openNow}</Link>
            <Link href="/map">{t.map}</Link>
            <Link href="/#how">{t.howItWorks}</Link>
          </div>
          <div className="footer-column">
            <h2>{c.company}</h2>
            <Link href="/about">{t.about}</Link>
            <Link href="/business">{t.business}</Link>
            <Link href="/contact">{t.contact}</Link>
            <Link href="/#faq">{c.faqLabel}</Link>
          </div>
          <div className="footer-column">
            <h2>{c.account}</h2>
            <Link href="/login">{t.signIn}</Link>
            <Link href="/signup">{t.signUp}</Link>
            <Link href="/favorites">{t.favorite}</Link>
            <Link href="/business/dashboard">{t.openDashboard}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <small>© {new Date().getFullYear()} Open24</small>
          <span>
            {t.qarshi}, {t.uzbekistan}
          </span>
          <div>
            <Link href="/privacy">{t.privacy}</Link>
            <Link href="/terms">{t.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
