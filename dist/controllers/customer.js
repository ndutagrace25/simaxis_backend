"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const customer_1 = __importDefault(require("../queries/customer"));
const axios_1 = __importDefault(require("axios"));
const config = require("../config/config").stron;
console.log(config, "configconfig");
const getCustomers = async (req, res) => {
    try {
        const customers = await customer_1.default.getAllCustomers();
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            customers,
        });
    }
    catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { is_verified } = req.body;
    try {
        const customer = await customer_1.default.update(id, { is_verified });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "Customer updated successfully",
            customer,
        });
    }
    catch (error) {
        console.error("Error updating customer:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const syncCustomerToStron = async (req, res) => {
    const { id } = req.body;
    try {
        const customer = await customer_1.default.getCustomerById(id);
        if (!customer) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Customer not found",
            });
        }
        const response = await axios_1.default.post(`${config.baseUrl}/NewCustomer`, {
            CompanyName: config.CompanyName,
            UserName: config.UserName,
            PassWord: config.PassWord,
            CustomerID: customer.dataValues.national_id,
            CustomerAddress: customer.dataValues.location,
            CustomerPhone: customer?.dataValues?.User?.dataValues?.phone,
            CustomerEmail: customer?.dataValues?.User?.dataValues?.email,
        });
        if (response.status === 200 &&
            response.data === "The current CUST_ID has exist in the system") {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: response.data,
            });
        }
        // update the customer
        await customer_1.default.update(id, { is_synced_to_stron: true });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "Customer saved to Stron successfully",
            customer,
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
module.exports = { getCustomers, syncCustomerToStron, updateCustomer };
