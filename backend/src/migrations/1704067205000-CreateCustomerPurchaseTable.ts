import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCustomerPurchaseTable1704067205000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
    );

    await queryRunner.createForeignKey(
      "customer_purchases",
      new TableForeignKey({
        columnNames: ["customerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("customer_purchases");
  }
}
