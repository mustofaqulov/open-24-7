import type { Metadata } from "next";
import "./globals.css";
import "./izohla-inspired.css";
import { LocaleProvider } from "@/components/locale";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageMotion } from "@/components/page-motion";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "Open24 — Find What's Open Near You",
    template: "%s | Open24",
  },
  description:
    "Find verified nearby businesses and see their opening status in Uzbekistan.",
  openGraph: {
    title: "Open24",
    description: "Your World, Always Open.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("open24-theme");document.documentElement.dataset.theme=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light"}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <LocaleProvider>
          <PageMotion />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
