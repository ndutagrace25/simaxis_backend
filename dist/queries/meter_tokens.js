"use strict";
const models_1 = require("../models");
const getAllMeterTokens = async (meter_id = "", page = 1, limit = 10, exportAll = false) => {
    const offset = (page - 1) * limit;
    const tokens = await models_1.MeterToken.findAndCountAll({
        where: meter_id ? { meter_id } : {},
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
