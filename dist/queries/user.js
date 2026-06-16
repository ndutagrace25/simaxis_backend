"use strict";
const models_1 = require("../models");
const getAllUsers = async () => {
    const users = await models_1.User.findAll({
        attributes: [
            "id",
            "username",
            "email",
            "phone",
            "role",
            "created_at",
            "updated_at",
        ],
    });
    return users;
};
const saveUser = async (userDetails) => {
    const user = await models_1.User.create(userDetails);
    return user;
};
const getUserByPhone = async (phone) => {
    const user = await models_1.User.findOne({
        where: { phone },
        attributes: ["id", "phone", "password", "role"],
        include: [
            {
                model: models_1.Customer,
                attributes: ["id", "is_verified", "first_name", "last_name"],
            },
            {
                model: models_1.Tenant,
                attributes: ["id", "first_name", "last_name"],
            },
        ],
    });
    return user;
};
const updateUser = async (id, newData) => {
    const updateUser = await models_1.User.update({ ...newData, updated_at: new Date() }, {
        where: { id },
        returning: true,
    });
    return updateUser;
};
module.exports = {
    getAllUsers,
    getUserByPhone,
    saveUser,
    updateUser,
};
