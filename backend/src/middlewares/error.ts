import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export async function errorHandler(c: Context, e: unknown) {
  if (e instanceof HTTPException) {
    return c.json({ message: e.message }, e.status);
  }

  let pgError = e as any;
  if (pgError && pgError.cause) {
    pgError = pgError.cause;
  }

  if (pgError && typeof pgError === 'object' && pgError.code === '23505') {
    if (pgError.constraint === 'unique_building_classroom_number') {
      return c.json({ message: 'លេខបន្ទប់ក្នុងអាគារនេះមានរួចហើយ' }, 409);
    }
    return c.json({ message: 'ទិន្នន័យមានរួចហើយ (ស្ទួន)' }, 409);
  }

  if (e && typeof e === 'object' && 'body' in e && (e as any).body?.code) {
    const apiError = e as any;
    const status = typeof apiError.status === 'number' ? apiError.status : 400;
    return c.json({ message: apiError.body.message, code: apiError.body.code }, status as any);
  }

  console.error("Unhandled error:", e);
  return c.json({ message: "Internal Server Error" }, 500);
}
