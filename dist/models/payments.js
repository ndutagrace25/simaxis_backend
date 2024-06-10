"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFactory = exports.Payments = void 0;
const sequelize_1 = require("sequelize");
class Payments extends sequelize_1.Model {
}
exports.Payments = Payments;
const PaymentFactory = (sequelize) => {
    Payments.init({
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
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "meters",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        payment_date: {
            type: sequelize_1.DataTypes.DATE,
        },
        amount: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
        },
        payment_method: {
            type: sequelize_1.DataTypes.STRING,
        },
        payment_code: {
            type: sequelize_1.DataTypes.STRING,
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
        tableName: "payments",
    });
    return Payments;
};
exports.PaymentFactory = PaymentFactory;
