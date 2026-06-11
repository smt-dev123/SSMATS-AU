import { TranslationRepository } from "@/repositories/translation.repository";
import type { Translation } from "@/types/translation";
import type {
  TranslationInput,
  UpdateTranslationInput,
} from "@/validators/translation";
import { HTTPException } from "hono/http-exception";

export class TranslationService {
  constructor(private readonly translationRepository: TranslationRepository) {}

  async i8nTranslate(
    language: string,
    namespace: string,
  ): Promise<Record<string, string>> {
    return this.translationRepository.i8nTranslate(language, namespace);
  }

  async findAll(): Promise<Translation[]> {
    return this.translationRepository.findAll();
  }

  async findById(id: number): Promise<Translation> {
    const translation = await this.translationRepository.findById(id);
    if (!translation) {
      throw new HTTPException(404, { message: "Translation not found" });
    }
    return translation;
  }

  async create(data: TranslationInput): Promise<Translation> {
    return this.translationRepository.createTranslation(data);
  }

  async bulkUpsertTranslation(
    data: TranslationInput[],
  ): Promise<Translation[]> {
    return this.translationRepository.bulkUpsertTranslation(data);
  }

  async update(id: number, data: UpdateTranslationInput): Promise<Translation> {
    if (Object.keys(data).length === 0) {
      throw new HTTPException(400, {
        message: "Update requires at least one field",
      });
    }
    let update: Translation | undefined;
    try {
      update = await this.translationRepository.updateTranslation(id, data);
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to update translation" });
    }
    if (!update) {
      throw new HTTPException(404, { message: "Translation not found" });
    }
    return update;
  }

  async delete(id: number): Promise<Translation> {
    const translation = this.translationRepository.deleteTranslation(id);
    if (!translation) {
      throw new HTTPException(404, { message: "Translation not found" });
    }
    return translation;
  }
}
