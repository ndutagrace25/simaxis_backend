"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const customer_1 = __importDefault(require("../queries/customer"));
const customer_meters_1 = __importDefault(require("../queries/customer_meters"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const config = require("../config/config").stron;
const getCustomers = async (req, res) => {
    const keyword = req?.query?.keyword ? req.query.keyword : "";
    try {
        const customers = await customer_1.default.getAllCustomers(keyword);
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
            message: "Customer verified successfully",
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
            CustomerID: `CTS-${customer.dataValues.customer_number}`,
            CustomerAddress: customer.dataValues.location,
            CustomerPhone: customer?.dataValues?.User?.dataValues?.phone,
            CustomerEmail: customer?.dataValues?.User?.dataValues?.email,
            CustomerName: customer?.dataValues.first_name + " " + customer?.dataValues.last_name,
        });
        if (response.status === 200 &&
            response.data === "The current CUST_ID has exist in the system") {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: response.data,
            });
        }
        // update the customer
        await customer_1.default.update(id, {
            is_synced_to_stron: true,
            is_active: true,
        });
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
const getLandlords = async (req, res) => {
    try {
        const landlords = await customer_1.default.getAllLandlords();
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            landlords,
        });
    }
    catch (error) {
        console.error("Error fetching landlords:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const attachMeterToCustomer = async (req, res) => {
    const { meter_id, customer_id } = req.body;
    try {
        //get customer meter by meter_id
        const meterAttached = await customer_meters_1.default.getCustomerMeterByMeterId(meter_id);
        if (meterAttached) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "The meter number is already attached to an agent/landlord",
            });
        }
        const customer_meter = await customer_meters_1.default.create({
            id: (0, uuid_1.v4)(),
            meter_id,
            customer_id,
        });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "Meter attached successfully",
            customer_meter,
        });
    }
    catch (error) {
        console.error("Error attaching meter to customer:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const getLandlordTenants = async (req, res) => {
    const { landlord_id } = req.params;
    try {
        const landlord_tenants = await customer_1.default.getLandlordTenants(landlord_id);
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            landlord_tenants,
        });
    }
    catch (error) {
        console.error("Error fetching landlord_tenants:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
module.exports = {
    attachMeterToCustomer,
    getCustomers,
    getLandlords,
    getLandlordTenants,
    syncCustomerToStron,
    updateCustomer,
};
