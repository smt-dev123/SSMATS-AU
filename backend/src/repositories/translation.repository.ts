import { type DrizzleDb } from "@/database";
import { translations } from "@/database/schemas";
import type { Translation } from "@/types/translation";
import type {
  TranslationInput,
  UpdateTranslationInput,
} from "@/validators/translation";
import { and, eq, sql } from "drizzle-orm";

export class TranslationRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findAll(): Promise<Translation[]> {
    return await this.db.query.translations.findMany();
  }

  async findById(id: number): Promise<Translation | undefined> {
    return await this.db.query.translations.findFirst({
      where: eq(translations.id, id),
    });
  }

  async i8nTranslate(
    language: string,
    namespace: string,
  ): Promise<Record<string, string>> {
    const translation = await this.db.query.translations.findMany({
      where: and(
        eq(translations.language, language),
        eq(translations.namespace, namespace),
      ),
    });

    const result = translation.reduce(
      (acc, translation) => {
        acc[translation.key] = translation.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return result;
  }

  async createTranslation(data: TranslationInput): Promise<Translation> {
    const [created] = await this.db
      .insert(translations)
      .values(data)
      .returning();
    return created!;
  }

  async bulkUpsertTranslation(
    data: TranslationInput[],
  ): Promise<Translation[]> {
    const created = await this.db
      .insert(translations)
      .values(data)
      .onConflictDoUpdate({
        target: [
          translations.namespace,
          translations.language,
          translations.key,
        ],
        set: {
          value: sql`EXCLUDED.value`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      })
      .returning();
    return created;
  }

  async updateTranslation(
    id: number,
    data: UpdateTranslationInput,
  ): Promise<Translation> {
    const [updated] = await this.db
      .update(translations)
      .set(data)
      .where(eq(translations.id, id))
      .returning();
    return updated!;
  }

  async deleteTranslation(id: number): Promise<Translation> {
    const [deleted] = await this.db
      .delete(translations)
      .where(eq(translations.id, id))
      .returning();
    return deleted!;
  }
}
