import { Repository } from "typeorm";
import { User } from "../entities/User";
import type { IUserRepository } from "../lib/database";
export declare class PostgresUserRepository implements IUserRepository {
    private repo;
    constructor(repo: Repository<User>);
    create(user: Omit<User, "id" | "createdAt" | "updatedAt" | "oauthAccounts" | "verificationTokens" | "refreshTokens" | "merchantSubscriptions" | "customerPurchases">): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
    list(limit?: number, offset?: number): Promise<User[]>;
    count(): Promise<number>;
}
//# sourceMappingURL=PostgresUserRepository.d.ts.map