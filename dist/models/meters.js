"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeterFactory = exports.Meter = void 0;
const sequelize_1 = require("sequelize");
class Meter extends sequelize_1.Model {
}
exports.Meter = Meter;
const MeterFactory = (sequelize) => {
    Meter.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        meter_type_id: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: "meter_types",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        serial_number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
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
        tableName: "meters",
    });
    return Meter;
};
exports.MeterFactory = MeterFactory;
