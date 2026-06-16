"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const meter_types_1 = __importDefault(require("../queries/meter_types"));
const getMeterTypes = async (req, res) => {
    try {
        const meter_types = await meter_types_1.default.getAllMeterTypes();
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            meter_types,
        });
    }
    catch (error) {
        console.error("Error fetching meter_types:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
module.exports = { getMeterTypes };
