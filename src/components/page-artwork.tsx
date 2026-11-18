import Image from "next/image";

/** Decorative imagery; business facts are carried by the adjacent content. */
export function PageArtwork({
  subject,
  className = "",
  priority = false,
}: {
  subject: "neighborhood" | "business" | "contact";
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`page-artwork ${className}`} aria-hidden="true">
      <Image
        src={`/images/redesign/${subject === "neighborhood" ? "neighborhood" : "cafe"}.webp`}
        alt=""
        fill
        sizes="(max-width: 760px) calc(100vw - 40px), 50vw"
        preload={priority}
      />
    </div>
  );
}
