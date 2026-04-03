"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMerchantSubscriptionTable1704067204000 = void 0;
const typeorm_1 = require("typeorm");
class CreateMerchantSubscriptionTable1704067204000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "merchant_subscriptions",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "gen_random_uuid()",
                },
                {
                    name: "merchantId",
                    type: "uuid",
                    isNullable: false,
                },
                {
                    name: "stripeSubscriptionId",
                    type: "varchar",
                    isUnique: true,
                    isNullable: true,
                },
                {
                    name: "stripePriceId",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "planName",
                    type: "enum",
                    enum: ["free", "starter", "pro", "enterprise"],
                    default: "'free'",
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["trialing", "active", "past_due", "canceled", "unpaid"],
                    default: "'trialing'",
                },
                {
                    name: "currentPeriodStart",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "currentPeriodEnd",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "canceledAt",
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
            ],
        }));
        await queryRunner.createForeignKey("merchant_subscriptions", new typeorm_1.TableForeignKey({
            columnNames: ["merchantId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("merchant_subscriptions");
    }
}
exports.CreateMerchantSubscriptionTable1704067204000 = CreateMerchantSubscriptionTable1704067204000;
//# sourceMappingURL=1704067204000-CreateMerchantSubscriptionTable.js.map