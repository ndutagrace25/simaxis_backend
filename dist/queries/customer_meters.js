"use strict";
const models_1 = require("../models");
const getAllCustomerMeters = async (query) => {
    const customer_meters = await models_1.CustomerMeter.findAll({
        where: query?.meter_id
            ? {
                meter_id: query?.meter_id,
            }
            : query?.customer_id
                ? { customer_id: query?.customer_id }
                : {},
        include: [
            {
                model: models_1.Customer,
                attributes: [
                    "first_name",
                    "middle_name",
                    "last_name",
                    "customer_number",
                ],
            },
            {
                model: models_1.Tenant,
                attributes: ["first_name", "last_name"],
            },
            {
                model: models_1.Meter,
                where: query?.county_number
                    ? { county_number: query?.county_number }
                    : {},
                attributes: ["serial_number", "county_number", "is_synced_to_stron"],
            },
        ],
        order: [["created_at", "DESC"]],
    });
    return customer_meters;
};
const getCustomerMeterByMeterId = async (meter_id) => {
    // console.log(meter_id, "meter id");
    const meter = await models_1.CustomerMeter.findOne({ where: { meter_id } });
    return meter;
};
const getCustomerMeterById = async (id) => {
    console.log(id, "id");
    const meter = await models_1.CustomerMeter.findOne({ where: { id } });
    return meter;
};
const getCustomerMeterByLandlordId = async (customer_id, serial_number) => {
    const meterWhere = serial_number ? { serial_number } : {};
    const landlord_meters = await models_1.CustomerMeter.findAll({
        where: { customer_id },
        include: [
            {
                model: models_1.Tenant,
                attributes: ["first_name", "last_name"],
            },
            {
                model: models_1.Meter,
                where: meterWhere,
                attributes: ["serial_number", "county_number", "is_synced_to_stron"],
                include: [
                    {
                        model: models_1.MeterToken,
                        attributes: ["token", "created_at", "amount"],
                        order: [["created_at", "ASC"]],
                    },
                ],
            },
        ],
    });
    return landlord_meters;
};
const getCustomerMeterByTenantId = async (tenant_id) => {
    const tenant_meters = await models_1.CustomerMeter.findOne({
        where: { tenant_id },
        include: [
            {
                model: models_1.Tenant,
                attributes: ["first_name", "last_name"],
            },
            {
                model: models_1.Meter,
                attributes: ["serial_number", "county_number", "is_synced_to_stron"],
                include: [
                    {
                        model: models_1.MeterToken,
                        attributes: ["token", "created_at", "amount"],
                        order: [["created_at", "DESC"]],
                    },
                ],
            },
        ],
    });
    return tenant_meters;
};
const create = async (customerMeterDetails) => {
    const customer_meter = await models_1.CustomerMeter.create(customerMeterDetails);
    return customer_meter;
};
const update = async (id, newData) => {
    const updatedCustomerMeter = await models_1.CustomerMeter.update(newData, {
        where: { id },
        returning: true,
    });
    return updatedCustomerMeter;
};
module.exports = {
    create,
    getAllCustomerMeters,
    getCustomerMeterByMeterId,
    getCustomerMeterById,
    getCustomerMeterByLandlordId,
    getCustomerMeterByTenantId,
    update,
};
