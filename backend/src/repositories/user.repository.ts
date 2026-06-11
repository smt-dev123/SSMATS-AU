import { type DrizzleDb } from "@/database";
import { user as userTable } from "@/database/schemas";
import type {
  CreateUser,
  User,
  UserQueryInput,
  UpdateUser,
} from "@/types/user";
import { and, count, eq, ilike, inArray, SQL } from "drizzle-orm";

export class UserRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findAll(query: UserQueryInput): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { name, email, role, page, limit } = query;
    const conditions: SQL[] = [];
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const allowedRoles = ["admin", "staff", "manager"] as const;
    conditions.push(inArray(userTable.role, allowedRoles));

    if (name?.trim())
      conditions.push(ilike(userTable.name, `%${name.trim()}%`));
    if (email?.trim())
      conditions.push(ilike(userTable.email, `%${email.trim()}%`));

    if (role && role !== "all" && allowedRoles.includes(role as any)) {
      conditions.push(eq(userTable.role, role));
    }

    const where = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.query.user.findMany({
        where,
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
        orderBy: (users, { desc }) => [desc(users.createdAt)],
      }),
      this.db.select({ total: count() }).from(userTable).where(where),
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.db.query.user.findFirst({
      where: eq(userTable.id, id),
    });
  }

  async create(data: CreateUser): Promise<User> {
    const [created] = await this.db
      .insert(userTable)
      .values(data as any)
      .returning();
    return created!;
  }

  async update(id: string, data: UpdateUser): Promise<User | undefined> {
    const [updated] = await this.db
      .update(userTable)
      .set(data)
      .where(eq(userTable.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<User> {
    const [deleted] = await this.db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();
    return deleted!;
  }
}
