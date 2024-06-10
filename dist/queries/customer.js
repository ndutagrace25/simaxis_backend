"use strict";
const models_1 = require("../models");
const getAllCustomers = async () => {
    const customers = await models_1.Customer.findAll({
        include: { model: models_1.User, attributes: ["phone", "email"] },
    });
    return customers;
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
        ],
        include: {
            model: models_1.User,
            attributes: ["phone", "email"],
        },
    });
    return customer;
};
module.exports = {
    getAllCustomers,
    getCustomerById,
    create,
    update,
};
