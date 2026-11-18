import { z } from "zod";
export const coordinates = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});
export const searchSchema = coordinates.extend({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(40).optional(),
  radius: z.coerce.number().min(0.5).max(50).default(10),
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(12),
  openNow: z.enum(["true", "false"]).default("false"),
  alwaysOpen: z.enum(["true", "false"]).default("false"),
});
export const registerSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(12).max(128),
  displayName: z.string().trim().min(2).max(80),
  locale: z.enum(["uz", "en", "ru"]).default("uz"),
});
export const loginSchema = z.object({ email: z.email(), password: z.string() });
export const businessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  categoryId: z.uuid(),
  address: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(3).max(80),
  phone: z.string().max(40).optional(),
  website: z
    .union([
      z.literal(""),
      z
        .url()
        .max(250)
        .refine(
          (value) => value.startsWith("https://") || value.startsWith("http://"),
          "Use an HTTP or HTTPS URL",
        ),
    ])
    .optional(),
  description: z.string().max(2000).optional(),
});
export const hoursSchema = z
  .array(
    z.object({
      weekday: z.number().int().min(0).max(6),
      openMinute: z.number().int().min(0).max(1439),
      closeMinute: z.number().int().min(0).max(1440),
      isClosed: z.boolean().default(false),
    }),
  )
  .max(28);
