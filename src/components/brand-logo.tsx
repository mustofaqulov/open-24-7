import type { SVGProps } from "react";

/**
 * Traced from the supplied 24/7 artwork. Colours come from CSS custom
 * properties so a theme can override the lockup in one place.
 */
const PIN =
  "M.5 298A297 297.5 0 0 1 594.5 298C594.5 402 564 502 297.5 757.5C31 502 .5 402 .5 298Z";
const WORD_INK =
  "M766 233 791 233 818 237 849 250 863 263 865 263 876 277 884 296 887 313 887 328 884 346 879 360 868 379 835 414 833 414 820 428 818 428 807 440 805 440 795 451 793 451 781 464 894 465 893 525 678 525 678 473 797 361 797 359 804 352 810 340 812 322 807 308 798 300 783 295 762 295 748 299 736 306 720 325 679 300 671 297 666 293 666 291 677 274 688 263 704 251 735 238 756 234 766 234ZM1037 238 1115 238 1115 240 1096 268 1093 270 1085 284 1082 286 1074 300 1071 302 1050 335 1047 337 1033 360 1023 372 1015 386 1012 388 1006 399 1003 401 1001 407 1062 407 1063 355 1065 354 1133 355 1133 406 1176 407 1176 467 1133 468 1133 525 1061 525 1061 467 913 467 914 414 919 409 925 398 933 389 939 378 942 376 946 368 949 366 962 345 965 343 969 335 972 333 978 322 981 320 985 312 988 310 992 302 995 300 1037 239ZM1374 238 1606 238 1607 241 1606 289 1503 523 1501 525 1421 525 1424 514 1430 504 1434 492 1439 484 1443 472 1453 453 1457 441 1462 433 1462 430 1522 298 1439 298 1439 342 1374 342 1374 239Z";
const WORD_ACCENT =
  "M1304 188 1363 188 1364 194 1362 196 1308 355 1287 411 1278 441 1272 454 1240 550 1238 552 1234 567 1232 571 1229 572 1170 571 1175 552 1183 533 1241 363 1247 350 1257 317 1259 315 1264 297 1300 198 1301 191 1304 189Z";

const INK = "var(--logo-ink)";
const ACCENT = "var(--logo-accent)";
const PAPER = "var(--logo-paper)";

function PinWithClock() {
  return (
    <>
      <path d={PIN} fill={INK} />
      <circle cx="297.5" cy="303.5" r="219" fill={PAPER} />
      <circle
        cx="297.5"
        cy="303.5"
        r="173"
        stroke={ACCENT}
        strokeWidth="35"
      />
      <path d="M297 305.5V179" stroke={ACCENT} strokeWidth="35" />
      <path d="M296.5 305.5 376.9 377.6" stroke={ACCENT} strokeWidth="34" />
      <circle cx="296.5" cy="305.5" r="17" fill={INK} />
    </>
  );
}

/** Pin and clock only, for favicons, avatars and tight spaces. */
export function BrandMark({
  title = "Open24",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 595 758"
      fill="none"
      role="img"
      aria-label={title}
      {...props}
    >
      <PinWithClock />
    </svg>
  );
}

/** Full lockup: the mark beside the 24/7 wordmark. */
export function BrandLogo({
  title = "Open24",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 1608 760"
      fill="none"
      role="img"
      aria-label={title}
      {...props}
    >
      <PinWithClock />
      <path d={WORD_INK} fill={INK} />
      <path d={WORD_ACCENT} fill={ACCENT} />
    </svg>
  );
}

export const BRAND_INK = "#0A2540";
export const BRAND_ACCENT = "#00B4FF";
export const BRAND_PAPER = "#E8F4FD";

type SvgOptions = {
  lockup?: boolean;
  ink?: string;
  accent?: string;
  paper?: string;
};

/**
 * The same artwork as standalone SVG markup, for renderers that cannot take
 * React children such as `next/og` image responses.
 */
export function brandLogoSvg({
  lockup = true,
  ink = BRAND_INK,
  accent = BRAND_ACCENT,
  paper = BRAND_PAPER,
}: SvgOptions = {}): string {
  const mark =
    `<path d="${PIN}" fill="${ink}"/>` +
    `<circle cx="297.5" cy="303.5" r="219" fill="${paper}"/>` +
    `<circle cx="297.5" cy="303.5" r="173" fill="none" stroke="${accent}" stroke-width="35"/>` +
    `<path d="M297 305.5V179" fill="none" stroke="${accent}" stroke-width="35"/>` +
    `<path d="M296.5 305.5 376.9 377.6" fill="none" stroke="${accent}" stroke-width="34"/>` +
    `<circle cx="296.5" cy="305.5" r="17" fill="${ink}"/>`;
  const word = lockup
    ? `<path d="${WORD_INK}" fill="${ink}"/><path d="${WORD_ACCENT}" fill="${accent}"/>`
    : "";
  const box = lockup ? "0 0 1608 760" : "0 0 595 758";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none">${mark}${word}</svg>`;
}

/** Data URI of {@link brandLogoSvg}, ready for an `<img src>`. */
export function brandLogoDataUri(options?: SvgOptions): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(brandLogoSvg(options))}`;
}
