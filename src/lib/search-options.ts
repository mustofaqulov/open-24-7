/** URL filters shared by the search, explore and map entry points. */
export function searchOptions(
  params: Record<string, string | string[] | undefined>,
) {
  const single = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const radius = Number(single("radius"));
  return {
    initialQuery: single("q"),
    initialCategory: single("category"),
    initialOpen: single("openNow") === "true",
    initialAlwaysOpen: single("alwaysOpen") === "true",
    initialRadius:
      Number.isFinite(radius) && radius >= 1 && radius <= 50
        ? Math.round(radius)
        : 10,
  };
}
