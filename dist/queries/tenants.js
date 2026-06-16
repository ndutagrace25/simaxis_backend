"use strict";
const models_1 = require("../models");
const getAllTenants = async () => {
    const tenants = await models_1.Tenant.findAll({
        attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "created_at",
            "updated_at",
        ],
        include: {
            model: models_1.Customer,
            attributes: ["first_name", "middle_name", "last_name", "building_name"],
        },
        order: [["created_at", "DESC"]],
    });
    return tenants;
};
const create = async (tenantDetails) => {
    const tenant = await models_1.Tenant.create(tenantDetails);
    return tenant;
};
module.exports = {
    getAllTenants,
    create,
};
