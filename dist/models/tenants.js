"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsFactory = exports.Tenants = void 0;
const sequelize_1 = require("sequelize");
class Tenants extends sequelize_1.Model {
}
exports.Tenants = Tenants;
const TenantsFactory = (sequelize) => {
    Tenants.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        first_name: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        last_name: {
            type: sequelize_1.DataTypes.STRING(255),
        },
        landlord_id: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: "customers",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(50),
        },
        email: {
            type: sequelize_1.DataTypes.STRING(50),
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
        tableName: "tenants",
    });
    return Tenants;
};
exports.TenantsFactory = TenantsFactory;
