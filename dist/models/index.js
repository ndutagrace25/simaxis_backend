"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Payment = exports.MeterTypes = exports.MeterToken = exports.Meter = exports.CustomerMeter = exports.Customer = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const user_1 = require("./user");
const customer_1 = require("./customer");
const dotenv_1 = __importDefault(require("dotenv"));
const meter_types_1 = require("./meter_types");
const meters_1 = require("./meters");
const customer_meters_1 = require("./customer_meters");
const meter_tokens_1 = require("./meter_tokens");
const payments_1 = require("./payments");
dotenv_1.default.config();
const env = process.env.NODE_ENV;
// @ts-ignore
const config = require("../config/config")[env];
console.log(config, "ALL");
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
// Define associations
User.hasOne(Customer, { foreignKey: "user_id" });
Customer.belongsTo(User, { foreignKey: "user_id" });
