import type { Knex } from "knex";
import 'dotenv/config';

const config: Knex.Config = {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
};

module.exports = config;
