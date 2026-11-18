import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy policy" };
export default function Page() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Privacy policy</h1>
          <p>
            Last updated October 2026. Review with local counsel before public
            launch.
          </p>
        </div>
        <article className="panel content-card">
          <h2>Information we use</h2>
          <p>
            Accounts store your email, display name, password hash, and saved
            places. Business submissions, reports, and contact messages store
            the information you provide. We use browser location only after you
            choose to share it; precise coordinates are sent for nearby search
            and route requests and are not saved as account history. A hash of
            the request IP address is kept briefly to limit abusive requests.
          </p>
          <h2>Maps and routes</h2>
          <p>
            When an enabled map loads, Google Maps Platform may process browser
            and device information and the map centre, including your chosen
            location. When you request a route, we send origin and destination
            coordinates to Google Routes through our server. Read{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Google’s Privacy Policy
            </a>
            . Our map and route use is also subject to the{" "}
            <a
              href="https://cloud.google.com/maps-platform/terms"
              target="_blank"
              rel="noreferrer"
            >
              Google Maps Platform Terms
            </a>
            .
          </p>
          <h2>Address search</h2>
          <p>
            If address search is configured and you submit a street or landmark
            query, Open24 sends that text to its configured Nominatim service.
            We use the returned coordinates only for your current search and do
            not save the query to your account. The service operator may process
            the query and network information under its own privacy terms. City
            selection and map selection remain available without an address
            query.
          </p>
          <h2>Retention and control</h2>
          <p>
            Session tokens expire after 14 days. You can remove your account and
            favorites in Settings. The planned daily maintenance job deletes
            contact messages after 90 days and resolved reports and audit
            entries after 365 days. Pending moderation records remain until
            review. Contact messages are visible to authorized staff; request
            earlier deletion through the contact form. The job must be scheduled
            before launch.
          </p>
          <h2>Security</h2>
          <p>
            Connections must use HTTPS in production. Passwords are hashed,
            sessions are stored server side, and access to business and
            administration features is checked on the server.
          </p>
        </article>
      </div>
    </div>
  );
}
