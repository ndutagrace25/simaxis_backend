import { Sequelize } from "sequelize";
import { UserFactory } from "./user";

import { CustomerFactory } from "./customer";
import dotenv from "dotenv";
import { MeterTypesFactory } from "./meter_types";
import { MeterFactory } from "./meters";
import { CustomerMeterFactory } from "./customer_meters";
import { MeterTokenFactory } from "./meter_tokens";
import { PaymentFactory } from "./payments";
import { TenantsFactory } from "./tenants";
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
const CustomerMeter = CustomerMeterFactory(sequelize);
const MeterTypes = MeterTypesFactory(sequelize);
const Meter = MeterFactory(sequelize);
const MeterToken = MeterTokenFactory(sequelize);
const Payment = PaymentFactory(sequelize);
const Tenant = TenantsFactory(sequelize);

// Define associations
// CUSTOMERS AND USERS
User.hasOne(Customer, { foreignKey: "user_id" });
Customer.belongsTo(User, { foreignKey: "user_id" });
// METER TYPES AND METERS
MeterTypes.hasMany(Meter, { foreignKey: "meter_type_id" });
Meter.belongsTo(MeterTypes, { foreignKey: "meter_type_id" });
// TENANT AND CUSTOMERS/LANDLORD
Customer.hasMany(Tenant, { foreignKey: "landlord_id" });
Tenant.belongsTo(Customer, { foreignKey: "landlord_id" });
// CUSTOMER/LANDLORD METERS AND CUSTOMERS
Customer.hasMany(CustomerMeter, { foreignKey: "customer_id" });
CustomerMeter.belongsTo(Customer, {foreignKey: "customer_id"});
// CUSTOMER METERS AND METERS
Meter.hasOne(CustomerMeter, { foreignKey: "meter_id" });
CustomerMeter.belongsTo(Meter, {foreignKey: "meter_id"});
// CUSTOMER METERS AND TENANTS
Tenant.hasOne(CustomerMeter, { foreignKey: "tenant_id" });
CustomerMeter.belongsTo(Tenant, {foreignKey: "tenant_id"});

export {
  sequelize,
  Customer,
  CustomerMeter,
  Meter,
  MeterToken,
  MeterTypes,
  Payment,
  Tenant,
  User,
};
