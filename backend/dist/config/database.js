"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
// TypeORM Database Configuration
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: env_1.DATABASE_HOST,
    port: env_1.DATABASE_PORT,
    username: env_1.DATABASE_USER,
    password: env_1.DATABASE_PASSWORD,
    database: env_1.DATABASE_NAME,
    synchronize: env_1.NODE_ENV === "development", // Auto-sync schema in dev
    logging: env_1.NODE_ENV === "development",
    entities: ["src/entities/*.ts"],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});
exports.default = exports.AppDataSource;
//# sourceMappingURL=database.js.map