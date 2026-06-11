import { SessionTimeRepository } from "@/repositories/session-time.repository";
import type { SessionTime } from "@/types/academy";
import type {
  SessionTimeInput,
  SessionTimeUpdateInput,
} from "@/validators/academy";
import { HTTPException } from "hono/http-exception";

export class SessionTimeService {
  constructor(private readonly sessionTimeRepo: SessionTimeRepository) {}

  async findAll() {
    return this.sessionTimeRepo.findAll();
  }

  async findById(id: number) {
    const sessionTime = this.sessionTimeRepo.findOne(id);
    if (!sessionTime) {
      throw new HTTPException(404, { message: "Session time not found" });
    }
    return sessionTime;
  }

  async create(sessionTimeData: SessionTimeInput) {
    return this.sessionTimeRepo.create(sessionTimeData);
  }

  async update(id: number, sessionTimeData: SessionTimeUpdateInput) {
    if (Object.keys(sessionTimeData).length === 0) {
      throw new HTTPException(400, {
        message: "Update requires at least one field",
      });
    }
    let update: SessionTime | undefined;
    try {
      update = await this.sessionTimeRepo.update(id, sessionTimeData);
    } catch (error) {
      throw new HTTPException(500, {
        message: "Failed to update session time",
      });
    }
    if (!update) {
      throw new HTTPException(404, { message: "Session time not found" });
    }
    return update;
  }

  async delete(id: number) {
    const sessionTime = this.sessionTimeRepo.delete(id);
    if (!sessionTime) {
      throw new HTTPException(404, { message: "Session time not found" });
    }
    return sessionTime;
  }
}
