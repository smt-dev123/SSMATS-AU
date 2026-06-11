import { type DrizzleDb } from "@/database";
import { sessionTimes } from "@/database/schemas";
import type { SessionTime } from "@/types/academy";
import type {
  SessionTimeInput,
  SessionTimeUpdateInput,
} from "@/validators/academy";
import { eq } from "drizzle-orm";

export class SessionTimeRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findOne(id: number): Promise<SessionTime | undefined> {
    return this.db.query.sessionTimes.findFirst({
      where: eq(sessionTimes.id, id),
    });
  }

  async findAll(): Promise<SessionTime[]> {
    return this.db.query.sessionTimes.findMany();
  }

  async create(sessionTimeData: SessionTimeInput): Promise<SessionTime> {
    const [newSessionTime] = await this.db
      .insert(sessionTimes)
      .values(sessionTimeData)
      .returning();
    return newSessionTime!;
  }

  async update(
    id: number,
    sessionTimeData: SessionTimeUpdateInput,
  ): Promise<SessionTime | undefined> {
    const [updatedSessionTime] = await this.db
      .update(sessionTimes)
      .set(sessionTimeData)
      .where(eq(sessionTimes.id, id))
      .returning();
    return updatedSessionTime;
  }

  async delete(id: number): Promise<SessionTime> {
    const [deletedSessionTime] = await this.db
      .delete(sessionTimes)
      .where(eq(sessionTimes.id, id))
      .returning();
    return deletedSessionTime!;
  }
}
