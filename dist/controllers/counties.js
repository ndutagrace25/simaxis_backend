"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const counties_1 = require("../utils/counties");
const getCounties = async (req, res) => {
    try {
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            counties: counties_1.counties,
        });
    }
    catch (error) {
        console.error("Error fetching counties:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
module.exports = { getCounties };
