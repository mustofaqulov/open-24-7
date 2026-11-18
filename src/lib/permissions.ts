export type ReviewKind = "business" | "claim" | "report";

export function canReview(role: string, kind: ReviewKind) {
  return role === "ADMIN" || (role === "MODERATOR" && kind === "report");
}
