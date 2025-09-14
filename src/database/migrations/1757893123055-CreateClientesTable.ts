import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientesTable1757893123055 implements MigrationInterface {
    name = 'CreateClientesTable1757893123055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clientes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "nome" varchar(255) NOT NULL, "saldo" decimal(10,2) NOT NULL DEFAULT (0), "api_key" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_43fdb2ed325c3a74862ddceebf7" UNIQUE ("api_key"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "clientes"`);
    }

}
