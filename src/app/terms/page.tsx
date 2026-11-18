import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of service" };
export default function Page() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Terms of service</h1>
          <p>
            Last updated October 2026. Review with local counsel before public
            launch.
          </p>
        </div>
        <article className="panel content-card">
          <h2>Using Open24</h2>
          <p>
            Open24 helps you discover businesses and reported opening hours.
            Listings, status, directions, and travel times may be incomplete or
            change without notice. Confirm essential services directly. Open24
            does not provide emergency response.
          </p>
          <h2>Business information</h2>
          <p>
            Submit only accurate business information that you have authority to
            provide. Ownership claims are reviewed; submitting a claim does not
            grant editing rights. We may correct, reject, or remove inaccurate
            listings.
          </p>
          <h2>Maps</h2>
          <p>
            Maps and directions provided by Google are subject to the{" "}
            <a
              href="https://cloud.google.com/maps-platform/terms"
              target="_blank"
              rel="noreferrer"
            >
              Google Maps Platform Terms of Service
            </a>
            , the{" "}
            <a
              href="https://maps.google.com/help/terms_maps/"
              target="_blank"
              rel="noreferrer"
            >
              Google Maps End User Additional Terms
            </a>
            , and the{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Google Privacy Policy
            </a>
            . Do not rely on routes without checking local conditions and
            traffic rules.
          </p>
          <p>
            Address search, when configured, uses OpenStreetMap-derived data
            through a separate Nominatim service. Addresses and coordinates may
            be incomplete; verify the chosen location before relying on a route.
            OpenStreetMap contributors are credited in search results.
          </p>
          <h2>Accounts</h2>
          <p>
            Keep your credentials private. Misuse, spam, false reports, and
            unauthorized access attempts may lead to account restriction.
            Contact us through the contact page for support.
          </p>
        </article>
      </div>
    </div>
  );
}
