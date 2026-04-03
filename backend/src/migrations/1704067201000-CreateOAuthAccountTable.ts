import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOAuthAccountTable1704067201000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
    );

    await queryRunner.createForeignKey(
      "oauth_accounts",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("oauth_accounts");
  }
}
