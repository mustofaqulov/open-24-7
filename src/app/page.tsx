"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Cross,
  ShoppingBasket,
  Utensils,
  Fuel,
  Landmark,
  HeartPulse,
  MapPin,
  Navigation,
  Plus,
  Store,
} from "lucide-react";
import { useT } from "@/components/locale";
import { NearbyPreview } from "@/components/nearby-preview";
import { HomeSearch } from "@/components/home-search";
import { RadiusControl } from "@/components/radius-control";
import { redesignCopy } from "@/lib/redesign-copy";

const categories = [
  {
    key: "pharmacy",
    icon: Cross,
    en: "Pharmacies",
    uz: "Dorixonalar",
    ru: "Аптеки",
  },
  {
    key: "grocery",
    icon: ShoppingBasket,
    en: "Grocery Stores",
    uz: "Oziq-ovqat",
    ru: "Продукты",
  },
  {
    key: "restaurant",
    icon: Utensils,
    en: "Restaurants",
    uz: "Restoranlar",
    ru: "Рестораны",
  },
  { key: "fuel", icon: Fuel, en: "Gas Stations", uz: "Yoqilg‘i", ru: "АЗС" },
  {
    key: "atm",
    icon: Landmark,
    en: "ATMs",
    uz: "Bankomatlar",
    ru: "Банкоматы",
  },
  {
    key: "medical",
    icon: HeartPulse,
    en: "Essential Services",
    uz: "Muhim xizmatlar",
    ru: "Важные услуги",
  },
] as const;

export default function Home() {
  const { t, locale } = useT();
  const c = redesignCopy[locale];
  const [benefit, setBenefit] = useState(0);
  const [radius, setRadius] = useState(10);
  const steps = [t.stepLocation, t.stepFilter, t.stepDirections];
  return (
    <>
      <section className="home-profile container" aria-labelledby="hero-title">
        <div className="home-profile-heading">
          <Image
            className="home-profile-avatar"
            src="/images/redesign/neighborhood.webp"
            alt=""
            width={72}
            height={72}
            preload
          />
          <div>
            <span className="eyebrow">{t.qarshi}, {t.uzbekistan}</span>
            <h1 id="hero-title">{c.heroFirst} {c.heroSecond}</h1>
            <p>{c.heroIntro}</p>
          </div>
        </div>
        <div className="home-profile-actions">
          <Link href="/explore?openNow=true">
            <Clock3 size={19} />
            {t.openNow}
          </Link>
          <Link href="/map">
            <MapPin size={19} />
            {t.map}
          </Link>
          <Link href="/explore?alwaysOpen=true">
            <span aria-hidden="true">24/7</span>
            {t.explore}
          </Link>
        </div>
      </section>

      <section className="home-search-section container" id="search">
        <div className="search-heading">
          <h2>{c.searchTitle}</h2>
          <p>{c.searchHint}</p>
        </div>
        <HomeSearch />
      </section>

      <NearbyPreview />

      <section className="section intro-section">
        <div className="container">
          <div className="intro-grid">
            <span className="eyebrow">
              <span className="section-dot" />
              {t.discovery}
            </span>
            <div>
              <h2>{c.intro}</h2>
              <p>{c.introText}</p>
            </div>
          </div>
          <div className="promise-row">
            {[
              { n: "01", title: t.openNow, text: t.stepFilter },
              { n: "02", title: t.map, text: t.stepLocation },
              { n: "03", title: t.directions, text: t.stepDirections },
            ].map((item) => (
              <div key={item.n}>
                <span className="promise-number">{item.n}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section category-section" id="categories">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{t.browseCategories}</span>
              <h2>{c.categoryTitle}</h2>
              <p>{c.categoryText}</p>
            </div>
            <Link className="text-link" href="/explore">
              {c.allPlaces}
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="categories">
            {categories.map((category, i) => {
              const Icon = category.icon;
              return (
                <Link
                  className="category-card"
                  href={`/explore?category=${category.key}`}
                  key={category.key}
                >
                  <span className="category-number" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <span className="category-icon">
                    <Icon size={32} strokeWidth={1.4} aria-hidden="true" />
                  </span>
                  <strong>{category[locale]}</strong>
                  <ArrowUpRight
                    className="category-arrow"
                    size={20}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section how-section" id="how">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{t.howItWorks}</span>
              <h2>{c.howTitle}</h2>
              <p>{c.howText}</p>
            </div>
          </div>
          <div className="how-grid">
            <div className="how-photo">
              <Image
                src="/images/redesign/neighborhood.webp"
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div className="photo-note">
                <Navigation size={18} />
                <span>{c.local}</span>
              </div>
              <div className="how-inset">
                <Image
                  src="/images/redesign/cafe.webp"
                  alt=""
                  width={240}
                  height={170}
                />
              </div>
            </div>
            <ol className="steps-list">
              {steps.map((text, i) => (
                <li key={i}>
                  <span className="step-number">0{i + 1}</span>
                  <div>
                    <h3>{c.stepTitles[i]}</h3>
                    <p>{text}</p>
                    <Link
                      className="text-link"
                      href={i === 1 ? "/explore?openNow=true" : "/explore"}
                    >
                      {i === 2 ? t.directions : t.explore}
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section benefits-section">
        <div className="container benefits-grid">
          <div className="benefits-copy">
            <span className="eyebrow">{t.slogan}</span>
            <h2>{c.benefitTitles[benefit]}</h2>
            <div className="benefit-tabs" role="group" aria-label={t.discovery}>
              {c.benefitTitles.map((title, i) => (
                <button
                  type="button"
                  key={title}
                  aria-label={title}
                  aria-pressed={benefit === i}
                  onClick={() => setBenefit(i)}
                >
                  0{i + 1}
                </button>
              ))}
            </div>
            <p aria-live="polite">{c.benefitText[benefit]}</p>
            <Link className="button" href="/explore">
              {c.start}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="benefits-photo">
            <Image
              src="/images/redesign/cafe.webp"
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <span className="photo-note">
              <Check size={16} />
              {t.discovery}
            </span>
          </div>
        </div>
      </section>

      <section className="section radius-section">
        <div className="container radius-layout">
          <div>
            <span className="eyebrow">{t.nearbyPlaces}</span>
            <h2>{c.radiusTitle}</h2>
            <p>{c.radiusText}</p>
            <RadiusControl value={radius} onChange={setRadius} />
          </div>
          <div className="radius-result">
            <span className="eyebrow">{c.radiusResult}</span>
            <div className="radius-value" aria-live="polite">
              {radius}
              <span>km</span>
            </div>
            <p>
              <MapPin size={16} />
              {t.qarshi}, {t.uzbekistan}
            </p>
            <Link
              className="button button-lime"
              href={`/explore?radius=${radius}`}
            >
              {c.radiusAction}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section business-section">
        <div className="container business-banner">
          <span className="business-icon">
            <Store size={35} strokeWidth={1.3} />
          </span>
          <div>
            <span className="eyebrow">{t.businessEyebrow}</span>
            <h2>{c.businessTitle}</h2>
            <p>{c.businessText}</p>
          </div>
          <Link className="button" href="/business">
            {t.business}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container faq-layout">
          <div>
            <span className="eyebrow">{c.faqLabel}</span>
            <h2>{c.faqTitle}</h2>
            <p>{c.faqText}</p>
            <Link className="text-link" href="/contact">
              {t.contact}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="faq-list">
            {c.faq.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-section container">
        <Image
          src="/images/redesign/neighborhood.webp"
          alt=""
          fill
          sizes="100vw"
        />
        <div className="closing-overlay" />
        <div className="closing-copy">
          <h2>{c.closingTitle}</h2>
          <p>{c.closingText}</p>
          <Link className="button button-paper" href="/explore">
            {c.start}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <a className="mobile-sticky-action" href="#search">
        {c.start}
        <ArrowRight size={18} aria-hidden="true" />
      </a>
    </>
  );
}
