"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOAuthAccountTable1704067201000 = void 0;
const typeorm_1 = require("typeorm");
class CreateOAuthAccountTable1704067201000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "oauth_accounts",
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
                    name: "provider",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "providerAccountId",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "providerEmail",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()",
                },
            ],
            indices: [
                {
                    columnNames: ["userId", "provider"],
                    isUnique: true,
                },
            ],
        }));
        await queryRunner.createForeignKey("oauth_accounts", new typeorm_1.TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("oauth_accounts");
    }
}
exports.CreateOAuthAccountTable1704067201000 = CreateOAuthAccountTable1704067201000;
//# sourceMappingURL=1704067201000-CreateOAuthAccountTable.js.map