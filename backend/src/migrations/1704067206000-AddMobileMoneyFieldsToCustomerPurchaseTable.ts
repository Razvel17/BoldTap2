import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMobileMoneyFieldsToCustomerPurchaseTable1704067206000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("customer_purchases", [
      new TableColumn({
        name: "provider",
        type: "varchar",
        isNullable: true,
      }),
      new TableColumn({
        name: "providerTransactionId",
        type: "varchar",
        isNullable: true,
      }),
      new TableColumn({
        name: "providerReference",
        type: "varchar",
        isNullable: true,
      }),
      new TableColumn({
        name: "phoneNumber",
        type: "varchar",
        isNullable: true,
      }),
    ]);

    await queryRunner.dropColumn("customer_purchases", "stripePaymentIntentId");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "customer_purchases",
      new TableColumn({
        name: "stripePaymentIntentId",
        type: "varchar",
        isNullable: true,
      }),
    );

    await queryRunner.dropColumns("customer_purchases", [
      "provider",
      "providerTransactionId",
      "providerReference",
      "phoneNumber",
    ]);
  }
}
