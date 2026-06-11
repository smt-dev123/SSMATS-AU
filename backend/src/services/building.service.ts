import type { BuildingRepository } from "@/repositories/building.repository";
import type { Building } from "@/types/infrastructure";
import { RedisCache } from "@/utils/redis";
import type {
  BuildingInput,
  BuildingQueryInput,
  BuildingUpdateInput,
} from "@/validators/infrastructure";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

export class BuildingService {
  private static readonly CACHE_TTL_SECONDS = 3600;

  constructor(
    private readonly buildingRepository: BuildingRepository,
    private readonly cache: RedisCache,
  ) {}

  async findAll(
    query: BuildingQueryInput,
  ): Promise<{ data: Building[]; total: number; page: number; limit: number }> {
    return this.buildingRepository.findAll(query);
  }

  async findById(id: number): Promise<Building> {
    const cacheKey = `buildings:${id}`;
    const cached = await this.cache.get<Building>(cacheKey);
    if (cached) return cached;

    const building = await this.buildingRepository.findOne(id);
    if (!building) {
      throw new HTTPException(404, { message: "Building not found" });
    }

    this.cache
      .set(cacheKey, building, BuildingService.CACHE_TTL_SECONDS)
      .catch(() => {});
    return building;
  }

  async create(data: BuildingInput): Promise<Building> {
    try {
      const building = await this.buildingRepository.create(data);
      this.cache
        .set(
          `buildings:${building.id}`,
          building,
          BuildingService.CACHE_TTL_SECONDS,
        )
        .catch(() => {});
      return building;
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Building "${data.name}" already exists`,
        });
      }
      throw new HTTPException(500, { message: "Failed to create building" });
    }
  }

  async update(id: number, data: BuildingUpdateInput): Promise<Building> {
    if (Object.keys(data).length === 0) {
      throw new HTTPException(400, {
        message: "Update requires at least one field",
      });
    }

    if (data.name !== undefined) {
      const existing = await this.buildingRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new HTTPException(409, {
          message: `Building name "${data.name}" is already in use`,
        });
      }
    }

    let updated: Building;
    try {
      updated = (await this.buildingRepository.update(id, data))!;
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Building name "${data.name}" is already in use`,
        });
      }
      throw new HTTPException(500, { message: "Failed to update building" });
    }

    if (!updated) {
      throw new HTTPException(404, { message: "Building not found" });
    }

    this.cache
      .set(`buildings:${id}`, updated, BuildingService.CACHE_TTL_SECONDS)
      .catch(() => {});
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.buildingRepository.delete(id);
    this.cache.del(`buildings:${id}`).catch(() => {});
    if (!deleted) {
      throw new HTTPException(404, { message: "Building not found" });
    }
  }
}
