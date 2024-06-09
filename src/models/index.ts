import { Sequelize } from "sequelize";
import { UserFactory } from "./user";

import config from "../config/config";

const sequelize = new Sequelize(
  // @ts-ignore
  config?.db?.database,
  config.db.username,
  config.db.password,
  { dialect: config.db.dialect, logging: config.db.logging }
);

const User = UserFactory(sequelize);

export { sequelize, User };
