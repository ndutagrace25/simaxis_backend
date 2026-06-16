"use strict";
const models_1 = require("../models");
const getAllMeterTypes = async () => {
    const meters = await models_1.MeterTypes.findAll();
    return meters;
};
module.exports = {
    getAllMeterTypes,
};
