"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Tenant = exports.Payment = exports.MeterTypes = exports.MeterToken = exports.Meter = exports.CustomerMeter = exports.Customer = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const user_1 = require("./user");
const customer_1 = require("./customer");
const dotenv_1 = __importDefault(require("dotenv"));
const meter_types_1 = require("./meter_types");
const meters_1 = require("./meters");
const customer_meters_1 = require("./customer_meters");
const meter_tokens_1 = require("./meter_tokens");
const payments_1 = require("./payments");
const tenants_1 = require("./tenants");
dotenv_1.default.config();
const env = process.env.NODE_ENV;
console.log(process.env.NODE_ENV, "my variables");
// @ts-ignore
const config = require("../config/config")[env];
const sequelize = new sequelize_1.Sequelize(
// @ts-ignore
config.database, config.username, config.password, config);
exports.sequelize = sequelize;
const User = (0, user_1.UserFactory)(sequelize);
exports.User = User;
const Customer = (0, customer_1.CustomerFactory)(sequelize);
exports.Customer = Customer;
const CustomerMeter = (0, customer_meters_1.CustomerMeterFactory)(sequelize);
exports.CustomerMeter = CustomerMeter;
const MeterTypes = (0, meter_types_1.MeterTypesFactory)(sequelize);
exports.MeterTypes = MeterTypes;
const Meter = (0, meters_1.MeterFactory)(sequelize);
exports.Meter = Meter;
const MeterToken = (0, meter_tokens_1.MeterTokenFactory)(sequelize);
exports.MeterToken = MeterToken;
const Payment = (0, payments_1.PaymentFactory)(sequelize);
exports.Payment = Payment;
const Tenant = (0, tenants_1.TenantsFactory)(sequelize);
exports.Tenant = Tenant;
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
CustomerMeter.belongsTo(Customer, { foreignKey: "customer_id" });
// CUSTOMER METERS AND METERS
Meter.hasOne(CustomerMeter, { foreignKey: "meter_id" });
CustomerMeter.belongsTo(Meter, { foreignKey: "meter_id" });
// CUSTOMER METERS AND TENANTS
Tenant.hasOne(CustomerMeter, { foreignKey: "tenant_id" });
CustomerMeter.belongsTo(Tenant, { foreignKey: "tenant_id" });
// METERS AND METER TOKENS
Meter.hasMany(MeterToken, { foreignKey: "meter_id" });
MeterToken.belongsTo(Meter, { foreignKey: "meter_id" });
// TENANTS AND USERS
User.hasOne(Tenant, { foreignKey: "user_id" });
Tenant.belongsTo(User, { foreignKey: "user_id" });
