// TypeORM Database Configuration
import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  NODE_ENV,
} from "./env";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  synchronize: NODE_ENV === "development", // Auto-sync schema in dev
  logging: NODE_ENV === "development",
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
});

export default AppDataSource;

