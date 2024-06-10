"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeterTypesFactory = exports.MeterTypes = void 0;
const sequelize_1 = require("sequelize");
class MeterTypes extends sequelize_1.Model {
}
exports.MeterTypes = MeterTypes;
const MeterTypesFactory = (sequelize) => {
    MeterTypes.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        description: {
            type: sequelize_1.DataTypes.STRING(255),
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
        tableName: "users",
    });
    return MeterTypes;
};
exports.MeterTypesFactory = MeterTypesFactory;
