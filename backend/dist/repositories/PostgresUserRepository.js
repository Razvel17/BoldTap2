"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserRepository = void 0;
class PostgresUserRepository {
    constructor(repo) {
        this.repo = repo;
    }
    async create(user) {
        const newUser = this.repo.create(user);
        return await this.repo.save(newUser);
    }
    async findById(id) {
        return await this.repo.findOne({ where: { id } }) || null;
    }
    async findByEmail(email) {
        return await this.repo.findOne({ where: { email } }) || null;
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return await this.findById(id);
    }
    async delete(id) {
        const result = await this.repo.delete(id);
        return (result.affected || 0) > 0;
    }
    async list(limit = 10, offset = 0) {
        return await this.repo.find({
            skip: offset,
            take: limit,
        });
    }
    async count() {
        return await this.repo.count();
    }
}
exports.PostgresUserRepository = PostgresUserRepository;
//# sourceMappingURL=PostgresUserRepository.js.map