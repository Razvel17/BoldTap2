// PostgreSQL User Repository
import { Repository } from "typeorm";
import { User } from "../entities/User";
import type { IUserRepository } from "../lib/database";

export class PostgresUserRepository implements IUserRepository {
  constructor(private repo: Repository<User>) {}

  async create(user: Omit<User, "id" | "createdAt" | "updatedAt" | "oauthAccounts" | "verificationTokens" | "refreshTokens" | "merchantSubscriptions" | "customerPurchases">): Promise<User> {
    const newUser = this.repo.create(user);
    return await this.repo.save(newUser);
  }

  async findById(id: string): Promise<User | null> {
    return await this.repo.findOne({ where: { id } }) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email } }) || null;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repo.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected || 0) > 0;
  }

  async list(limit = 10, offset = 0): Promise<User[]> {
    return await this.repo.find({
      skip: offset,
      take: limit,
    });
  }

  async count(): Promise<number> {
    return await this.repo.count();
  }
}
