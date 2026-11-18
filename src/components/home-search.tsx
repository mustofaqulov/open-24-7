"use client";
import { Select } from "@/components/select";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { useT } from "./locale";
export function HomeSearch() {
  const { t, locale } = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<
    { id: string; key: string; nameUz: string; nameEn: string; nameRu: string }[]
  >([]);
  useEffect(() => {
    fetch("/api/v1/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data.items || []))
      .catch(() => {});
  }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    router.push(`/search?${params}`);
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setMessage(t.locationDenied);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        sessionStorage.setItem(
          "open24-pending-location",
          JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude }),
        );
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category) params.set("category", category);
        router.push(`/search?${params}`);
      },
      () => setMessage(t.locationDenied),
      { timeout: 10000, maximumAge: 0 },
    );
  };
  return (
    <>
      <form className="hero-search" onSubmit={submit}>
        <label className="sr-only" htmlFor="home-search">
          {t.search}
        </label>
        <input
          id="home-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
        />
        <button className="button" type="submit">
          <Search size={17} />
          {t.search}
        </button>
      </form>
      <div className="home-search-options">
        <label className="sr-only" htmlFor="home-category">
          {t.all}
        </label>
        <Select
          id="home-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">{t.all}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.key}>
              {locale === "uz"
                ? item.nameUz
                : locale === "ru"
                  ? item.nameRu
                  : item.nameEn}
            </option>
          ))}
        </Select>
        <button
          className="button button-outline button-small"
          type="button"
          onClick={locate}
        >
          <LocateFixed size={15} />
          {t.useLocation}
        </button>
      </div>
      <small style={{ display: "block", color: "var(--muted)", marginTop: 7 }}>
        {t.locationPrivacy}
      </small>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </>
  );
}
