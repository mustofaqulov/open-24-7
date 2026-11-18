"use client";
import { PageArtwork } from "@/components/page-artwork";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useT } from "@/components/locale";
export function ContactForm() {
  const { t } = useT();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const r = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>{t.contactTitle}</h1>
          <p>{t.contactIntro}</p>
        </div>
        <div className="illustrated-layout contact-layout">
          <form className="panel content-card" onSubmit={submit}>
            <div className="field">
              <label htmlFor="contact-name">{t.name}</label>
              <input id="contact-name" name="name" required minLength={2} />
            </div>
            <div className="field">
              <label htmlFor="contact-email">{t.email}</label>
              <input id="contact-email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="contact-message">{t.messageLabel}</label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={6}
              />
            </div>
            {status === "sent" && (
              <p className="notice" role="status">
                {t.messageReceived}
              </p>
            )}
            {status === "error" && (
              <p className="notice error-notice" role="alert">
                {t.messageFailed}
              </p>
            )}
            <button className="button" disabled={status === "sending"}>
              {status === "sending" ? t.pleaseWait : t.sendMessage}
            </button>
          </form>
          <aside className="contact-story">
            <PageArtwork subject="contact" priority />
            <div className="contact-story-copy">
              <span className="contact-story-icon" aria-hidden="true">
                <MessageCircle size={21} />
              </span>
              <h2>{t.contactSupportTitle}</h2>
              <p>{t.contactSupportCopy}</p>
              <span className="contact-story-signature">
                Open<span>24</span>
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
