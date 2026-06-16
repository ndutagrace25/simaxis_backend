"use strict";
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const getAllMeters = async (searchTerm = "") => {
    // @ts-ignore
    const is_number = !isNaN(parseFloat(searchTerm)) && isFinite(searchTerm);
    const searchCondition = {
        [sequelize_1.Op.or]: [
            {
                serial_number: is_number ? BigInt(searchTerm) : 0,
            },
        ],
    };
    const meters = await models_1.Meter.findAll({
        where: searchTerm ? searchCondition : {},
        include: { model: models_1.MeterTypes, attributes: ["name", "type"] },
        order: [["created_at", "DESC"]],
    });
    return meters;
};
const create = async (meterDetails) => {
    const meter = await models_1.Meter.create(meterDetails);
    return meter;
};
const update = async (id, newData) => {
    const updatedMeter = await models_1.Meter.update(newData, {
        where: { id },
        returning: true,
    });
    return updatedMeter;
};
const getMeterById = async (id) => {
    const meter = await models_1.Meter.findOne({
        where: { id },
        attributes: ["id", "serial_number"],
        include: { model: models_1.MeterTypes, attributes: ["name", "type"] },
    });
    return meter;
};
const getMeterBySerialNumber = async (serial_number) => {
    const meter = await models_1.Meter.findOne({
        where: { serial_number },
        attributes: ["id", "serial_number", "is_synced_to_stron"],
    });
    return meter;
};
const getSyncedMeters = async () => {
    const synced_meters = await models_1.Meter.findAll({
        where: { is_synced_to_stron: true },
        attributes: ["id", "serial_number"],
        include: [{ model: models_1.CustomerMeter, attributes: ["id", "meter_id"] }],
    });
    return synced_meters;
};
module.exports = {
    create,
    getAllMeters,
    getMeterById,
    getMeterBySerialNumber,
    getSyncedMeters,
    update,
};
