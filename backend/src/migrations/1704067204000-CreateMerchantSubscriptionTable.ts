import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMerchantSubscriptionTable1704067204000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
    );

    await queryRunner.createForeignKey(
      "merchant_subscriptions",
      new TableForeignKey({
        columnNames: ["merchantId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("merchant_subscriptions");
  }
}
