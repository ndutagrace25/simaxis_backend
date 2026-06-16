"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const customer_meters_1 = __importDefault(require("../queries/customer_meters"));
const axios_1 = __importDefault(require("axios"));
const config = require("../config/config").stron;
const getCustomerMeters = async (req, res) => {
    try {
        const customer_meters = await customer_meters_1.default.getAllCustomerMeters(req.query);
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            customer_meters,
        });
    }
    catch (error) {
        console.error("Error fetching customer_meters:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const syncCustomerAccountToStron = async (req, res) => {
    const { id, Account_ID, CUST_ID, METER_ID, Categories } = req.body;
    try {
        const customer_meter = await customer_meters_1.default.getCustomerMeterById(id);
        if (!customer_meter) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Account not found",
            });
        }
        const category = Categories || customer_meter.get("categories") || "Domestic";
        const endpoint = customer_meter.get("is_synced_to_stron")
            ? "UpdateAccount"
            : "NewAccount";
        const response = await axios_1.default.post(`${config.baseUrl}/${endpoint}`, {
            CompanyName: config.CompanyName,
            UserName: config.UserName,
            PassWord: config.PassWord,
            Account_ID,
            CUST_ID,
            METER_ID,
            SStation_ID: "Sta-00001",
            Categories: category,
        });
        if (response.status === 200 &&
            (response.data ===
                "Account ID alreadyis bound to the user. You cannot add this Account ID For a account again!" ||
                response.data === "false" ||
                response.data === "The current meter ID does not exist in the system" ||
                response.data ===
                    "The current Price Categories does not exist in the system" ||
                response.data === "The current CUST_ID does not exist in the system")) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: response.data === "false"
                    ? "You are trying to forward an invalid meter number"
                    : response.data,
            });
        }
        // update the customer meter
        const updatedCustomerMeter = await customer_meters_1.default.update(id, {
            is_synced_to_stron: true,
            categories: category,
        });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: customer_meter.get("is_synced_to_stron")
                ? "Customer meter updated on Stron successfully"
                : "Customer meter saved to Stron successfully",
            customer_meter: updatedCustomerMeter,
            stron_status: response.data,
        });
    }
    catch (error) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
            error: error.errors,
        });
    }
};
const getCustomerMetersPerLandlord = async (req, res) => {
    const { id } = req.params;
    const serial_number = req.query?.serial_number;
    try {
        const landlord_meters = await customer_meters_1.default.getCustomerMeterByLandlordId(id, serial_number);
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            landlord_meters,
        });
    }
    catch (error) {
        console.error("Error fetching landlord_meters:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const getCustomerMetersPerTenant = async (req, res) => {
    const { id } = req.params;
    try {
        const tenant_meter = await customer_meters_1.default.getCustomerMeterByTenantId(id);
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            tenant_meter,
        });
    }
    catch (error) {
        console.error("Error fetching tenant_meters:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const updateCustomerMeter = async (req, res) => {
    const { tenant_id, categories } = req.body;
    const { id } = req.params;
    try {
        const updatedCustomerMeter = await customer_meters_1.default.update(id, {
            tenant_id,
            categories,
        });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "Customer meter updated successfully",
            customer_meter: updatedCustomerMeter,
        });
    }
    catch (error) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
module.exports = {
    getCustomerMeters,
    syncCustomerAccountToStron,
    getCustomerMetersPerLandlord,
    getCustomerMetersPerTenant,
    updateCustomerMeter,
};
