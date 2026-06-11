import z from "zod";

const VALIDATION = {
  LANGUAGE: {
    MIN: 2,
    MAX: 5,
  },
  STRING: {
    MIN: 1,
    MAX: 255,
  },
} as const;

export const translationSchema = z.object({
  namespace: z
    .string()
    .min(1, "Namespace is required")
    .max(VALIDATION.STRING.MAX),
  value: z
    .string()
    .min(1, "Translation value is required")
    .max(VALIDATION.STRING.MAX),
  language: z
    .string()
    .min(
      VALIDATION.LANGUAGE.MIN,
      `Language must be at least ${VALIDATION.LANGUAGE.MIN} characters`,
    )
    .max(
      VALIDATION.LANGUAGE.MAX,
      `Language cannot exceed ${VALIDATION.LANGUAGE.MAX} characters`,
    )
    .regex(/^[a-z-]+$/, "Language must be lowercase letters with hyphens"),
  key: z
    .string()
    .min(1, "Translation key is required")
    .max(VALIDATION.STRING.MAX)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Key can only contain alphanumeric characters, dots, hyphens, and underscores",
    ),
});

export const updateTranslationSchema = translationSchema.partial();

export const bulkTranslationSchema = z.object({
  namespace: z
    .string()
    .min(1, "Namespace is required")
    .max(VALIDATION.STRING.MAX),
  language: z
    .string()
    .min(
      VALIDATION.LANGUAGE.MIN,
      `Language must be at least ${VALIDATION.LANGUAGE.MIN} characters`,
    )
    .max(
      VALIDATION.LANGUAGE.MAX,
      `Language cannot exceed ${VALIDATION.LANGUAGE.MAX} characters`,
    )
    .regex(/^[a-z-]+$/, "Language must be lowercase letters with hyphens"),
  translations: z
    .record(
      z
        .string()
        .min(1, "Translation key is required")
        .max(VALIDATION.STRING.MAX)
        .regex(
          /^[a-zA-Z0-9._-]+$/,
          "Key can only contain alphanumeric characters, dots, hyphens, and underscores",
        ),
      z
        .string()
        .min(1, "Translation value is required")
        .max(VALIDATION.STRING.MAX),
    )
    .refine(
      (translations) => Object.keys(translations).length > 0,
      "At least one translation is required",
    ),
});

export type TranslationInput = z.infer<typeof translationSchema>;
export type UpdateTranslationInput = z.infer<typeof updateTranslationSchema>;
export type BulkTranslationInput = z.infer<typeof bulkTranslationSchema>;
