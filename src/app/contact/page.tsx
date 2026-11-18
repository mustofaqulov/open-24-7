import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
export const metadata: Metadata = { title: "Contact Open24" };
export default function Page() {
  return <ContactForm />;
}
