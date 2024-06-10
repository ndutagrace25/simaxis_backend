"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerFactory = exports.Customer = void 0;
const sequelize_1 = require("sequelize");
class Customer extends sequelize_1.Model {
}
exports.Customer = Customer;
const CustomerFactory = (sequelize) => {
    Customer.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        first_name: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        middle_name: {
            type: sequelize_1.DataTypes.STRING(50),
        },
        last_name: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        national_id: {
            type: sequelize_1.DataTypes.INTEGER,
        },
        location: {
            type: sequelize_1.DataTypes.STRING(50),
        },
        lat: {
            type: sequelize_1.DataTypes.FLOAT,
        },
        long: {
            type: sequelize_1.DataTypes.FLOAT,
        },
        plot_number: {
            type: sequelize_1.DataTypes.STRING,
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
        },
        is_verified: {
            type: sequelize_1.DataTypes.BOOLEAN,
        },
        is_synced_to_stron: {
            type: sequelize_1.DataTypes.BOOLEAN,
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
        tableName: "customers",
    });
    return Customer;
};
exports.CustomerFactory = CustomerFactory;
