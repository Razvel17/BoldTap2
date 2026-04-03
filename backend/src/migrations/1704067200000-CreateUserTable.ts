import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
