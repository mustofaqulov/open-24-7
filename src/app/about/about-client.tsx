"use client";
import { PageArtwork } from "@/components/page-artwork";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/components/locale";

export function AboutClient() {
  const { t } = useT();
  const sections = [
    [t.aboutStart, t.aboutCoverage],
    [t.aboutStatus, t.aboutStatusDescription],
    [t.aboutOwners, t.aboutOwnersDescription],
  ];
  return (
    <div className="page-shell story-page">
      <div className="container">
        <div className="story-hero">
          <div className="page-heading">
            <span className="eyebrow">
              <span className="section-dot" />
              {t.slogan}
            </span>
            <h1>{t.aboutTitle}</h1>
            <p>{t.aboutIntro}</p>
            <Link className="button" href="/explore">
              {t.explore}
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <PageArtwork subject="neighborhood" priority />
        </div>
        <div className="story-sections">
          {sections.map(([title, text], i) => (
            <section className="story-row" key={title}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
