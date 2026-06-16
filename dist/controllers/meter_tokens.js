"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const meter_tokens_1 = __importDefault(require("../queries/meter_tokens"));
const utils_1 = require("../utils");
const axios_1 = __importDefault(require("axios"));
const sms_config = require("../config/config").sms;
const getMeterTokens = async (req, res) => {
    const meter_id = req?.query?.meter_id ? req.query.meter_id : "";
    try {
        const tokens = await meter_tokens_1.default.getAllMeterTokens(meter_id);
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            tokens,
        });
    }
    catch (error) {
        console.error("Error fetching tokens:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const sendTokensManually = async (req, res) => {
    const { token, phone, meter_number } = req.body;
    const cleanedPhone = (0, utils_1.cleanPhone)(phone);
    if (!cleanedPhone) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Invalid phone number",
        });
    }
    try {
        //send sms
        await axios_1.default.post(`${sms_config?.baseUrlOtp}`, {
            apikey: sms_config?.apikey,
            partnerID: sms_config?.partnerID,
            mobile: `${cleanedPhone}`,
            message: `Mtr: ${meter_number}\nToken: ${token}`,
            shortcode: "SI-MAXIS",
        });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "Tokens sent successfully",
        });
    }
    catch (error) {
        console.error("Error sending tokens manually:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
module.exports = { getMeterTokens, sendTokensManually };
