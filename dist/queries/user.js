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
        attributes: ["id", "phone", "password"],
        include: {
            model: models_1.Customer,
            attributes: ["is_verified", "first_name", "last_name"],
        },
    });
    return user;
};
module.exports = {
    getAllUsers,
    getUserByPhone,
    saveUser,
};
