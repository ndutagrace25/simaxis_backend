"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerMeterFactory = exports.CustomerMeter = void 0;
const sequelize_1 = require("sequelize");
class CustomerMeter extends sequelize_1.Model {
}
exports.CustomerMeter = CustomerMeter;
const CustomerMeterFactory = (sequelize) => {
    CustomerMeter.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        customer_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "customers",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        meter_id: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: "meters",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        categories: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: "Domestic",
        },
        is_synced_to_stron: {
            type: sequelize_1.DataTypes.BOOLEAN,
        },
        account_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
    }, {
        sequelize,
        timestamps: false,
        tableName: "customer_meters",
        hooks: {
            beforeCreate: (customer_meter) => {
                customer_meter.account_id = Math.floor(Math.random() * 100000);
            },
        },
    });
    return CustomerMeter;
};
exports.CustomerMeterFactory = CustomerMeterFactory;
