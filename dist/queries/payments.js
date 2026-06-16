"use strict";
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const getAllPayments = async (searchTerm = "") => {
    const searchCondition = {
        [sequelize_1.Op.or]: [
            { meter_number: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            { phone_number: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            { payment_code: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
        ],
    };
    const meters = await models_1.Payment.findAll({
        where: searchTerm ? searchCondition : {},
        order: [["created_at", "DESC"]],
    });
    return meters;
};
const create = async (paymentDetails) => {
    const meter = await models_1.Payment.create(paymentDetails);
    return meter;
};
const getPaymentByMpesaCode = async (payment_code) => {
    const payment = await models_1.Payment.findOne({
        where: { payment_code },
    });
    return payment;
};
// Get daily revenue for a specific month
const getDailyRevenue = async (year, month) => {
    // Month is 1-based (1 = January, 12 = December)
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0); // Start of first day
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of last day of the month
    const dailyRevenue = await models_1.Payment.findAll({
        attributes: [
            [(0, sequelize_1.fn)("DATE", (0, sequelize_1.col)("created_at")), "date"],
            [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("amount")), "revenue"],
            [(0, sequelize_1.fn)("EXTRACT", (0, sequelize_1.literal)("DAY FROM created_at")), "day"],
        ],
        where: {
            created_at: {
                [sequelize_1.Op.between]: [startDate, endDate],
            },
        },
        group: [
            (0, sequelize_1.fn)("DATE", (0, sequelize_1.col)("created_at")),
            (0, sequelize_1.fn)("EXTRACT", (0, sequelize_1.literal)("DAY FROM created_at")),
        ],
        order: [[(0, sequelize_1.fn)("DATE", (0, sequelize_1.col)("created_at")), "ASC"]],
        raw: true,
    });
    return dailyRevenue.map((item) => ({
        period: item.day.toString(),
        revenue: parseFloat(item.revenue) || 0,
        date: item.date,
    }));
};
// Get monthly revenue for a specific year
const getMonthlyRevenue = async (year) => {
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0); // Start of January 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // End of December 31st
    const monthlyRevenue = await models_1.Payment.findAll({
        attributes: [
            [(0, sequelize_1.fn)("EXTRACT", (0, sequelize_1.literal)("MONTH FROM created_at")), "month"],
            [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("amount")), "revenue"],
            [(0, sequelize_1.fn)("TO_CHAR", (0, sequelize_1.col)("created_at"), "YYYY-MM"), "date"],
        ],
        where: {
            created_at: {
                [sequelize_1.Op.between]: [startDate, endDate],
            },
        },
        group: [
            (0, sequelize_1.fn)("EXTRACT", (0, sequelize_1.literal)("MONTH FROM created_at")),
            (0, sequelize_1.fn)("TO_CHAR", (0, sequelize_1.col)("created_at"), "YYYY-MM"),
        ],
        order: [[(0, sequelize_1.fn)("EXTRACT", (0, sequelize_1.literal)("MONTH FROM created_at")), "ASC"]],
        raw: true,
    });
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    return monthlyRevenue.map((item) => ({
        period: months[parseInt(item.month) - 1],
        revenue: parseFloat(item.revenue) || 0,
        date: item.date,
    }));
};
// Get yearly revenue for the last N years
const getYearlyRevenue = async (yearsBack = 5) => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsBack + 1;
    const startDate = new Date(startYear, 0, 1, 0, 0, 0, 0); // Start of first year
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); // End of current year
    const yearlyRevenue = await models_1.Payment.findAll({
        attributes: [
            [(0, sequelize_1.fn)("EXTRACT", (0, sequelize_1.literal)("YEAR FROM created_at")), "year"],
            [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("amount")), "revenue"],
        ],
        where: {
            created_at: {
                [sequelize_1.Op.between]: [startDate, endDate],
            },
        },
        group: [(0, sequelize_1.fn)("EXTRACT", (0, sequelize_1.literal)("YEAR FROM created_at"))],
        order: [[(0, sequelize_1.fn)("EXTRACT", (0, sequelize_1.literal)("YEAR FROM created_at")), "ASC"]],
        raw: true,
    });
    return yearlyRevenue.map((item) => ({
        period: item.year.toString(),
        revenue: parseFloat(item.revenue) || 0,
        date: item.year.toString(),
    }));
};
module.exports = {
    create,
    getAllPayments,
    getPaymentByMpesaCode,
    getDailyRevenue,
    getMonthlyRevenue,
    getYearlyRevenue,
};
