"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMobileMoneyFieldsToCustomerPurchaseTable1704067206000 = void 0;
const typeorm_1 = require("typeorm");
class AddMobileMoneyFieldsToCustomerPurchaseTable1704067206000 {
    async up(queryRunner) {
        await queryRunner.addColumns("customer_purchases", [
            new typeorm_1.TableColumn({
                name: "provider",
                type: "varchar",
                isNullable: true,
            }),
            new typeorm_1.TableColumn({
                name: "providerTransactionId",
                type: "varchar",
                isNullable: true,
            }),
            new typeorm_1.TableColumn({
                name: "providerReference",
                type: "varchar",
                isNullable: true,
            }),
            new typeorm_1.TableColumn({
                name: "phoneNumber",
                type: "varchar",
                isNullable: true,
            }),
        ]);
        await queryRunner.dropColumn("customer_purchases", "stripePaymentIntentId");
    }
    async down(queryRunner) {
        await queryRunner.addColumn("customer_purchases", new typeorm_1.TableColumn({
            name: "stripePaymentIntentId",
            type: "varchar",
            isNullable: true,
        }));
        await queryRunner.dropColumns("customer_purchases", [
            "provider",
            "providerTransactionId",
            "providerReference",
            "phoneNumber",
        ]);
    }
}
exports.AddMobileMoneyFieldsToCustomerPurchaseTable1704067206000 = AddMobileMoneyFieldsToCustomerPurchaseTable1704067206000;
//# sourceMappingURL=1704067206000-AddMobileMoneyFieldsToCustomerPurchaseTable.js.map