import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const config = {
  db: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
};

export default config;
