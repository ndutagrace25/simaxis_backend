"use strict";
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const getAllMeterTokens = async (meter_id = "", page = 1, limit = 10, exportAll = false, start_date = "", end_date = "") => {
    const offset = (page - 1) * limit;
    const where = meter_id ? { meter_id } : {};
    if (start_date || end_date) {
        const createdAtFilter = {};
        if (start_date) {
            createdAtFilter[sequelize_1.Op.gte] = new Date(`${start_date}T00:00:00.000Z`);
        }
        if (end_date) {
            createdAtFilter[sequelize_1.Op.lte] = new Date(`${end_date}T23:59:59.999Z`);
        }
        where.created_at = createdAtFilter;
    }
    const tokens = await models_1.MeterToken.findAndCountAll({
        where,
        include: [
            {
                model: models_1.Meter,
                attributes: ["serial_number"],
            },
        ],
        order: [["created_at", "DESC"]],
        ...(exportAll ? {} : { limit, offset }),
        distinct: true,
    });
    return tokens;
};
const getMeterTokenById = async (id) => {
    const token = await models_1.MeterToken.findOne({ where: { id } });
    return token;
};
const getMeterTokenByToken = async (token) => {
    const meterToken = await models_1.MeterToken.findOne({ where: { token } });
    return meterToken;
};
const create = async (tokenDetails) => {
    const token = await models_1.MeterToken.create(tokenDetails);
    return token;
};
module.exports = {
    create,
    getAllMeterTokens,
    getMeterTokenById,
    getMeterTokenByToken,
};
