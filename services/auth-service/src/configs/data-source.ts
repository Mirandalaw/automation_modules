import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path"
import dotenv from "dotenv";
// 환경 변수 로드
// dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
// 환경 변수 유효성 검사
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error("환경 변수(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)를 확인하세요.");
  process.exit(1);
}
export const AppDataSource: DataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [__dirname + "/../entities/**/*.{ts,js}"],
  migrations: [__dirname + "/../migration/**/*.{ts,js}"],
  subscribers: [],
  extra: {
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT) || 2000,
  },

});