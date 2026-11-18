"use client";
import { PageArtwork } from "@/components/page-artwork";
import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
import { useT } from "@/components/locale";

export function BusinessClient() {
  const { t } = useT();
  return (
    <div className="page-shell story-page">
      <div className="container">
        <div className="story-hero">
          <div className="page-heading">
            <span className="eyebrow">
              <Store size={15} />
              {t.businessEyebrow}
            </span>
            <h1>{t.businessTitle}</h1>
            <p>{t.businessIntro}</p>
            <div className="detail-actions">
              <Link className="button" href="/business/register">
                {t.registerBusiness}
                <ArrowUpRight size={17} />
              </Link>
              <Link className="text-link" href="/business/dashboard">
                {t.openDashboard}
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
          <PageArtwork subject="business" priority />
        </div>
        <section className="business-process">
          <div>
            <span className="eyebrow">OPEN24 / BUSINESS</span>
            <h2>{t.businessHow}</h2>
          </div>
          <p>{t.businessProcess}</p>
        </section>
      </div>
    </div>
  );
}
