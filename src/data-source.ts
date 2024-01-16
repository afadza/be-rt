import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "ep-lingering-bonus-71103436.ap-southeast-1.aws.neon.tech",
  port: 5432,
  username: "arya.skoba",
  password: "7cqTgyOX2Udj",
  database: "db_rt",
  synchronize: true,
  logging: false,
  entities: ["src/entity/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: [],
  ssl: true,
});
