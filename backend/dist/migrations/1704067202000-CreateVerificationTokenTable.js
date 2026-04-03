"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVerificationTokenTable1704067202000 = void 0;
const typeorm_1 = require("typeorm");
class CreateVerificationTokenTable1704067202000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "verification_tokens",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "gen_random_uuid()",
                },
                {
                    name: "userId",
                    type: "uuid",
                    isNullable: false,
                },
                {
                    name: "token",
                    type: "varchar",
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: "type",
                    type: "enum",
                    enum: ["email_verification", "password_reset"],
                    isNullable: false,
                },
                {
                    name: "expiresAt",
                    type: "timestamp",
                    isNullable: false,
                },
                {
                    name: "usedAt",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()",
                },
            ],
        }));
        await queryRunner.createForeignKey("verification_tokens", new typeorm_1.TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("verification_tokens");
    }
}
exports.CreateVerificationTokenTable1704067202000 = CreateVerificationTokenTable1704067202000;
//# sourceMappingURL=1704067202000-CreateVerificationTokenTable.js.map