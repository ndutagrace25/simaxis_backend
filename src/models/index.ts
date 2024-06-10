import { Sequelize } from "sequelize";
import { UserFactory } from "./user";

import { CustomerFactory } from "./customer";
import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV;

// @ts-ignore
const config = require("../config/config").database[env];

const sequelize = new Sequelize(
  // @ts-ignore
  config.database,
  config.username,
  config.password,
  config
);

const User = UserFactory(sequelize);
const Customer = CustomerFactory(sequelize);

// Define associations
User.hasOne(Customer, { foreignKey: "user_id" });
Customer.belongsTo(User, { foreignKey: "user_id" });

export { sequelize, Customer, User };
