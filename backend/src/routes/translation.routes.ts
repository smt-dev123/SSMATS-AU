import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  translationSchema,
  updateTranslationSchema,
} from "@/validators/translation";
import authentication from "@/middlewares/auth";

const router = new Hono();

router.get("/translate", authentication, async (c) => {
  const { translationService } = c.var.container;
  const language = c.req.query("language") || "en";
  const namespace = c.req.query("namespace") || "common";
  const result = await translationService.i8nTranslate(language, namespace);
  return c.json(result);
});

router.post("/", zValidator("json", translationSchema), async (c) => {
  const { translationService } = c.var.container;
  const data = c.req.valid("json");
  const translation = await translationService.create(data);
  return c.json(translation);
});

router.post(
  "/bulk",
  zValidator("json", translationSchema.array()),
  async (c) => {
    const { translationService } = c.var.container;
    const data = c.req.valid("json");
    const translations = await translationService.bulkUpsertTranslation(data);
    return c.json(translations);
  },
);

router.put("/:id", zValidator("json", updateTranslationSchema), async (c) => {
  const { translationService } = c.var.container;
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");
  const translation = await translationService.update(id, data);
  return c.json(translation);
});

router.delete("/:id", async (c) => {
  const { translationService } = c.var.container;
  const id = parseInt(c.req.param("id"));
  const translation = await translationService.delete(id);
  return c.json(translation);
});

export default router;
