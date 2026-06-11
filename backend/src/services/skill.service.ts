import type { SkillRepository } from "@/repositories/skill.repository";
import type {
  CreateSkill,
  Skill,
  SkillQueryInput,
  UpdateSkill,
} from "@/types/academy";
import { HTTPException } from "hono/http-exception";

export class SkillService {
  constructor(private skillRepository: SkillRepository) {}

  async create(data: CreateSkill): Promise<Skill | undefined> {
    return await this.skillRepository.create(data);
  }

  async update(id: number, data: UpdateSkill): Promise<Skill | undefined> {
    if (!Object.keys(data).length)
      throw new HTTPException(400, { message: "No data provided" });
    const skill = await this.skillRepository.findById(id);
    if (!skill) throw new HTTPException(404, { message: "Skill not found" });
    return await this.skillRepository.update(id, data);
  }

  async delete(id: number): Promise<Skill | undefined> {
    const skill = await this.skillRepository.findById(id);
    if (!skill) throw new HTTPException(404, { message: "Skill not found" });
    return await this.skillRepository.delete(id);
  }

  async findById(id: number): Promise<Skill | undefined> {
    const skill = await this.skillRepository.findById(id);
    if (!skill) throw new HTTPException(404, { message: "Skill not found" });
    return skill;
  }

  async findAll(query: SkillQueryInput): Promise<{
    total: number;
    data: Skill[];
    page: number;
    limit: number;
  }> {
    return await this.skillRepository.findAll(query);
  }
}
