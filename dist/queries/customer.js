"use strict";
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const getAllCustomers = async (searchTerm = "") => {
    const searchCondition = {
        [sequelize_1.Op.or]: [
            { first_name: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            { last_name: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            { middle_name: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            {
                "$User.email$": { [sequelize_1.Op.iLike]: `%${searchTerm}%` },
            },
            {
                "$User.phone$": { [sequelize_1.Op.iLike]: `%${searchTerm}%` },
            },
        ],
    };
    const customers = await models_1.Customer.findAll({
        where: searchTerm ? searchCondition : {},
        include: {
            model: models_1.User,
            attributes: ["phone", "email"],
        },
        order: [["created_at", "DESC"]],
    });
    return customers;
};
const getAllLandlords = async () => {
    const landlords = await models_1.Customer.findAll({
        where: { is_verified: true, is_synced_to_stron: true },
        attributes: ["id", "first_name", "last_name", "building_name", "location"],
    });
    return landlords;
};
const create = async (customerDetails) => {
    const customer = await models_1.Customer.create(customerDetails);
    return customer;
};
const update = async (id, newData) => {
    const updatedCustomer = await models_1.Customer.update(newData, {
        where: { id },
        returning: true,
    });
    return updatedCustomer;
};
const getCustomerById = async (id) => {
    const customer = await models_1.Customer.findOne({
        where: { id },
        attributes: [
            "id",
            "first_name",
            "middle_name",
            "last_name",
            "national_id",
            "location",
            "customer_number",
        ],
        include: {
            model: models_1.User,
            attributes: ["phone", "email"],
        },
    });
    return customer;
};
const getLandlordTenants = async (landlord_id) => {
    const landlord_tenants = await models_1.Tenant.findAll({
        where: { landlord_id },
        attributes: ["id", "first_name", "last_name"],
    });
    return landlord_tenants;
};
module.exports = {
    getAllCustomers,
    getAllLandlords,
    getCustomerById,
    getLandlordTenants,
    create,
    update,
};
