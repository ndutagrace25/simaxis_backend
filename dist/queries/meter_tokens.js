"use strict";
const models_1 = require("../models");
const getAllMeterTokens = async (meter_id = "") => {
    const tokens = await models_1.MeterToken.findAll({
        where: meter_id ? { meter_id } : {},
        include: [
            {
                model: models_1.Meter,
                attributes: ["serial_number"],
            },
        ],
        order: [["created_at", "DESC"]],
    });
    return tokens;
};
const create = async (tokenDetails) => {
    const token = await models_1.MeterToken.create(tokenDetails);
    return token;
};
module.exports = {
    create,
    getAllMeterTokens,
};
