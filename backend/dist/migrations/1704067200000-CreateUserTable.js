"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable1704067200000 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserTable1704067200000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "users",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "gen_random_uuid()",
                },
                {
                    name: "email",
                    type: "varchar",
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: "name",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "phone",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "password",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "emailVerified",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "userType",
                    type: "enum",
                    enum: ["customer", "merchant", "both"],
                    default: "'customer'",
                },
                {
                    name: "stripeCustomerId",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "refreshTokenSecret",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "passwordResetToken",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "passwordResetExpires",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "deletedAt",
                    type: "timestamp",
                    isNullable: true,
                },
            ],
            indices: [
                {
                    columnNames: ["email"],
                    isUnique: true,
                },
            ],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("users");
    }
}
exports.CreateUserTable1704067200000 = CreateUserTable1704067200000;
//# sourceMappingURL=1704067200000-CreateUserTable.js.map