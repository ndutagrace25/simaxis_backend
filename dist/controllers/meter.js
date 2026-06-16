"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const meter_1 = __importDefault(require("../queries/meter"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const config = require("../config/config").stron;
const getAllMeters = async (req, res) => {
    const keyword = req?.query?.keyword ? req.query.keyword : "";
    try {
        const meters = await meter_1.default.getAllMeters(keyword);
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            meters,
        });
    }
    catch (error) {
        console.error("Error fetching meters:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
// create a new meter
const createMeter = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: errors.errors[0]?.msg,
        });
    }
    const { meter_type_id, serial_number, county_number } = req.body;
    let data = {
        id: (0, uuid_1.v4)(),
        meter_type_id,
        serial_number,
        county_number,
    };
    try {
        const meterExists = await meter_1.default.getMeterBySerialNumber(serial_number);
        if (meterExists) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "The meter you are trying to add already exists",
            });
        }
        const meter = await meter_1.default.create(data);
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "Meter saved successfully",
            meter,
        });
    }
    catch (error) {
        console.error("Error saving", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
            errors: error.errors,
        });
    }
};
const updateMeter = async (req, res) => {
    const { id } = req.params;
    const { is_synced_to_stron } = req.body;
    try {
        const meter = await meter_1.default.update(id, { is_synced_to_stron });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "Meter updated successfully",
            meter,
        });
    }
    catch (error) {
        console.error("Error updating meter:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const syncMeterToStron = async (req, res) => {
    const { id } = req.body;
    try {
        const meter = await meter_1.default.getMeterById(id);
        console.log(meter?.dataValues.serial_number, meter?.dataValues?.MeterType?.dataValues?.type);
        if (!meter) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Meter not found",
            });
        }
        const response = await axios_1.default.post(`${config.baseUrl}/NewMeter`, {
            CompanyName: config.CompanyName,
            UserName: config.UserName,
            PassWord: config.PassWord,
            MeterID: meter.dataValues.serial_number,
            MeterType: meter?.dataValues?.MeterType?.dataValues?.type,
        });
        console.log(response);
        if (response.status === 200 &&
            (response.data === "Meter ID already exists!" ||
                response.data === "false")) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: response.data === "false"
                    ? "You are trying to forward an invalid meter number"
                    : response.data,
            });
        }
        // update the meter
        const updatedMeter = await meter_1.default.update(id, {
            is_synced_to_stron: true,
        });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "Meter saved to Stron successfully",
            meter: updatedMeter,
            stron_status: response.data,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
            error: error.errors,
        });
    }
};
const getSyncedAndAttachedMeters = async (req, res) => {
    try {
        const synced_meters = await meter_1.default.getSyncedMeters();
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            synced_meters,
        });
    }
    catch (error) {
        console.error("Error fetching synced_meters:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const clearMeterTamper = async (req, res) => {
    const { id } = req.body;
    try {
        const meter = await meter_1.default.getMeterById(id);
        if (!meter) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Meter not found",
            });
        }
        const response = await axios_1.default.post(`${config.baseUrl}/ClearTamperDirectly`, {
            CompanyName: config.CompanyName,
            UserName: config.UserName,
            PassWord: config.PassWord,
            METER_ID: meter.dataValues.serial_number,
        });
        if (response.data === "false01") {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Meter tamper not cleared, ensure the meter exists in stron system",
                stron_status: response.data,
            });
        }
        else {
            // update the meter
            const updatedMeter = await meter_1.default.update(id, {
                tamper_value: response.data,
            });
            return res.status(http_status_1.default.OK).json({
                statusCode: http_status_1.default.OK,
                message: "Meter tamper cleared successfully",
                meter: updatedMeter,
                stron_status: response.data,
            });
        }
    }
    catch (error) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
            error: error.errors,
        });
    }
};
const clearMeterCredit = async (req, res) => {
    const { id } = req.body;
    try {
        const meter = await meter_1.default.getMeterById(id);
        if (!meter) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Meter not found",
            });
        }
        const response = await axios_1.default.post(`${config.baseUrl}/ClearCreditDirectly`, {
            CompanyName: config.CompanyName,
            UserName: config.UserName,
            PassWord: config.PassWord,
            METER_ID: meter.dataValues.serial_number,
        });
        if (response.data === "false01" || response.data === "false") {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Meter credit not cleared, ensure the meter exists in stron system",
                stron_status: response.data,
            });
        }
        else {
            // update the meter
            const updatedMeter = await meter_1.default.update(id, {
                credit_value: response.data,
            });
            return res.status(http_status_1.default.OK).json({
                statusCode: http_status_1.default.OK,
                message: "Meter credit cleared successfully",
                meter: updatedMeter,
                stron_status: response.data,
            });
        }
    }
    catch (error) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
            error: error.errors,
        });
    }
};
module.exports = {
    createMeter,
    clearMeterCredit,
    clearMeterTamper,
    getAllMeters,
    getSyncedAndAttachedMeters,
    syncMeterToStron,
    updateMeter,
};
