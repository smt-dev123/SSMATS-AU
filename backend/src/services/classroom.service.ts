import type { BuildingRepository } from "@/repositories/building.repository";
import type { ClassroomRepository } from "@/repositories/classroom.repository";
import type { Classroom, ClassroomWithBuilding } from "@/types/infrastructure";
import type { RedisCache } from "@/utils/redis";
import type {
  ClassroomInput,
  ClassroomQueryInput,
  ClassroomUpdateInput,
} from "@/validators/infrastructure";
import { HTTPException } from "hono/http-exception";

export class ClassroomService {
  private static readonly CACHE_TTL_SECONDS = 3600;

  constructor(
    private readonly classroomRepository: ClassroomRepository,
    private readonly buildingRepository: BuildingRepository,
    private readonly cache: RedisCache,
  ) {}

  async findAll(query: ClassroomQueryInput): Promise<{
    data: ClassroomWithBuilding[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.classroomRepository.findAll(query);
  }

  async findById(id: number): Promise<Classroom> {
    const cacheKey = `classrooms:${id}`;
    const cached = await this.cache.get<Classroom>(cacheKey);
    if (cached) return cached;

    const classroom = await this.classroomRepository.findOne(id);
    if (!classroom) {
      throw new HTTPException(404, { message: "Classroom not found" });
    }

    this.cache
      .set(cacheKey, classroom, ClassroomService.CACHE_TTL_SECONDS)
      .catch(() => {});
    return classroom;
  }

  async create(data: ClassroomInput): Promise<Classroom> {
    const building = await this.buildingRepository.findOne(data.buildingId);
    if (!building) {
      throw new HTTPException(404, {
        message: `Building with ID ${data.buildingId} does not exist`,
      });
    }

    const created = await this.classroomRepository.create(data);
    this.cache
      .set(
        `classrooms:${created.id}`,
        created,
        ClassroomService.CACHE_TTL_SECONDS,
      )
      .catch(() => {});
    return created;
  }

  async update(id: number, data: ClassroomUpdateInput): Promise<Classroom> {
    if (Object.keys(data).length === 0) {
      throw new HTTPException(400, {
        message: "Update requires at least one field",
      });
    }

    // Always verify existence upfront to fail fast and avoid partial work
    const current = await this.classroomRepository.findOne(id);
    if (!current) {
      throw new HTTPException(404, { message: "Classroom not found" });
    }

    if (data.buildingId !== undefined) {
      const newBuilding = await this.buildingRepository.findOne(
        data.buildingId,
      );
      if (!newBuilding) {
        throw new HTTPException(404, {
          message: `Target building with ID ${data.buildingId} does not exist`,
        });
      }
    }

    if (data.name !== undefined || data.buildingId !== undefined) {
      const targetBuildingId = data.buildingId ?? current.buildingId;
      const targetName = data.name ?? current.name;

      const duplicate = await this.classroomRepository.findByBuildingAndName(
        targetBuildingId,
        targetName,
      );
      if (duplicate && duplicate.id !== id) {
        const building =
          await this.buildingRepository.findOne(targetBuildingId);
        throw new HTTPException(409, {
          message: `Classroom "${targetName}" already exists in building "${building?.name ?? `ID ${targetBuildingId}`}"`,
        });
      }
    }

    // Safe to assert non-null: we verified existence above and no deletion occurs between calls
    const updated = (await this.classroomRepository.update(id, data))!;
    this.cache
      .set(`classrooms:${id}`, updated, ClassroomService.CACHE_TTL_SECONDS)
      .catch(() => {});
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.classroomRepository.delete(id);
    this.cache.del(`classrooms:${id}`).catch(() => {});
    if (!deleted) {
      throw new HTTPException(404, { message: "Classroom not found" });
    }
  }
}
