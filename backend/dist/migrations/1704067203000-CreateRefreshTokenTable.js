"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRefreshTokenTable1704067203000 = void 0;
const typeorm_1 = require("typeorm");
class CreateRefreshTokenTable1704067203000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "refresh_tokens",
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
                    name: "tokenHash",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "expiresAt",
                    type: "timestamp",
                    isNullable: false,
                },
                {
                    name: "revokedAt",
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
        await queryRunner.createForeignKey("refresh_tokens", new typeorm_1.TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("refresh_tokens");
    }
}
exports.CreateRefreshTokenTable1704067203000 = CreateRefreshTokenTable1704067203000;
//# sourceMappingURL=1704067203000-CreateRefreshTokenTable.js.map