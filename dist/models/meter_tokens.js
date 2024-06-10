"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeterTokenFactory = exports.MeterToken = void 0;
const sequelize_1 = require("sequelize");
class MeterToken extends sequelize_1.Model {
}
exports.MeterToken = MeterToken;
const MeterTokenFactory = (sequelize) => {
    MeterToken.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        token: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
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
        issue_date: {
            type: sequelize_1.DataTypes.DATE,
        },
        amount: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
        },
        token_type: {
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
        tableName: "meter_tokens",
    });
    return MeterToken;
};
exports.MeterTokenFactory = MeterTokenFactory;
