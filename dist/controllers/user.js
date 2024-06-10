"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../queries/user"));
const customer_1 = __importDefault(require("../queries/customer"));
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const utils_1 = require("../utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loginUser = async (req, res) => {
    const validationErrors = (0, express_validator_1.validationResult)(req).array();
    if (validationErrors.length > 0) {
        const [error] = validationErrors;
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ statusCode: http_status_1.default.BAD_REQUEST, message: error.msg });
    }
    const { phone, password } = req.body;
    try {
        const userExists = await user_1.default.getUserByPhone((0, utils_1.cleanPhone)(phone));
        if (!userExists?.phone) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "User doesn't exist, kindly register to proceed",
            });
        }
        if (userExists?.Customer) {
            const { is_verified } = userExists?.Customer.dataValues;
            if (!is_verified) {
                return res.status(http_status_1.default.BAD_REQUEST).json({
                    statusCode: http_status_1.default.BAD_REQUEST,
                    message: "Your account is not yet verified, once verified you will be notified",
                });
            }
        }
        // check the provided password if it matches user's password
        await bcrypt_1.default.compare(password, userExists?.password, (err, isValid) => {
            if (isValid) {
                const jwt_secret = process.env.JWT_SECRET;
                const data = userExists?.Customer?.dataValues;
                // create access token on login
                let token = jsonwebtoken_1.default.sign(data, jwt_secret, {
                    expiresIn: "2h",
                });
                return res.status(http_status_1.default.OK).json({
                    statusCode: http_status_1.default.OK,
                    message: "Login success!",
                    token,
                    user: {
                        id: userExists.id,
                        first_name: userExists?.Customer?.first_name,
                        last_name: userExists?.Customer?.last_name,
                    },
                });
            }
            else {
                return res.status(http_status_1.default.BAD_REQUEST).json({
                    statusCode: http_status_1.default.BAD_REQUEST,
                    message: "Invalid password!",
                });
            }
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
const registerUser = async (req, res) => {
    const validationErrors = (0, express_validator_1.validationResult)(req).array();
    if (validationErrors.length > 0) {
        const [error] = validationErrors;
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ statusCode: http_status_1.default.BAD_REQUEST, message: error.msg });
    }
    const { first_name, middle_name, last_name, national_id, location, plot_number, email, password, phone, username, } = req.body;
    const salt = await bcrypt_1.default.genSalt(10);
    const hashedPassowd = await bcrypt_1.default.hash(password, salt);
    const user_id = (0, uuid_1.v4)();
    let user_data = {
        id: user_id,
        email,
        phone: (0, utils_1.cleanPhone)(phone),
        password: hashedPassowd,
        role: "Tenant",
        username,
    };
    let customer_data = {
        id: (0, uuid_1.v4)(),
        user_id,
        first_name,
        middle_name,
        last_name,
        national_id,
        location,
        plot_number,
    };
    try {
        const user = await user_1.default.saveUser(user_data);
        const customer = await customer_1.default.create(customer_data);
        return res
            .status(http_status_1.default.OK)
            .json({ statusCode: http_status_1.default.OK, user, customer });
    }
    catch (error) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
            errors: error.errors,
        });
    }
};
const getUsers = async (req, res) => {
    try {
        const users = await user_1.default.getAllUsers();
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            users,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
// create a new user account
const saveUser = async (req, res) => {
    const { username, phone, email, role, password } = req.body;
    let data = {
        id: (0, uuid_1.v4)(),
        username,
        phone,
        email,
        role,
        password,
    };
    try {
        const user = await user_1.default.saveUser(data);
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            message: "User saved successfully",
            user,
        });
    }
    catch (error) {
        console.error("Error saving", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.errors,
        });
    }
};
module.exports = { loginUser, getUsers, registerUser, saveUser };
