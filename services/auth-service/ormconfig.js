module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [
    'src/entities/**/*.ts'
  ],
  migrations: [
    'src/migrations/**/*.ts'
  ],
  subscribers: [
    'src/subscribers/**/*.ts'
  ],
  cli: {
    migrationsDir: 'src/migrations'
  }
};
