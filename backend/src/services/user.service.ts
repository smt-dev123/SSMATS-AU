import { UserRepository } from "@/repositories/user.repository";
import type { CreateUser, UpdateUser, UserQueryInput } from "@/types/user";
import { auth } from "@/lib/auth";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUsers(query: UserQueryInput) {
    return await this.userRepository.findAll(query);
  }

  async getUserById(id: string) {
    return await this.userRepository.findById(id);
  }

  async createUser(data: CreateUser) {
    // We use Better Auth API to create user to handle password hashing
    const result = await auth.api.createUser({
      body: {
        email: data.email,
        password: data.password!,
        name: data.name,
        role: (data.role as any) || "staff",
        image: data.image,
      } as any,
    });
    return result;
  }

  async updateUser(id: string, data: UpdateUser) {
    // Note: If updating password, we should use auth.api.changePassword or similar
    // For now, we update other fields via repository
    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    return await this.userRepository.delete(id);
  }
}
