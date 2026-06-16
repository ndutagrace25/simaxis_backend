"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const tenants_1 = __importDefault(require("../queries/tenants"));
const getTenants = async (req, res) => {
    try {
        const tenants = await tenants_1.default.getAllTenants();
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            tenants,
        });
    }
    catch (error) {
        console.error("Error fetching tenants:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
module.exports = { getTenants };
