import { Sequelize } from "sequelize";
import { UserFactory } from "./user";

import { CustomerFactory } from "./customer";
import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV;

// @ts-ignore
const config = require("../config/config")[env];


const sequelize = new Sequelize(
  // @ts-ignore
  config.database,
  config.username,
  config.password,
  config
);

const User = UserFactory(sequelize);
const Customer = CustomerFactory(sequelize);

export { sequelize, Customer, User };
