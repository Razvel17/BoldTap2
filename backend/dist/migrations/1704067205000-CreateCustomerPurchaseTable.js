"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerPurchaseTable1704067205000 = void 0;
const typeorm_1 = require("typeorm");
class CreateCustomerPurchaseTable1704067205000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "customer_purchases",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "gen_random_uuid()",
                },
                {
                    name: "customerId",
                    type: "uuid",
                    isNullable: false,
                },
                {
                    name: "stripePaymentIntentId",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "productType",
                    type: "enum",
                    enum: ["nfc_card", "ring", "other"],
                    isNullable: false,
                },
                {
                    name: "amount",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    isNullable: false,
                },
                {
                    name: "currency",
                    type: "varchar",
                    default: "'USD'",
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "succeeded", "failed", "cancelled"],
                    default: "'pending'",
                },
                {
                    name: "metadata",
                    type: "jsonb",
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
        await queryRunner.createForeignKey("customer_purchases", new typeorm_1.TableForeignKey({
            columnNames: ["customerId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("customer_purchases");
    }
}
exports.CreateCustomerPurchaseTable1704067205000 = CreateCustomerPurchaseTable1704067205000;
//# sourceMappingURL=1704067205000-CreateCustomerPurchaseTable.js.map