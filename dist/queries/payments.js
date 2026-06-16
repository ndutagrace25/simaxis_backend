"use strict";
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
// Helper function to calculate revenue split
const calculateRevenueSplit = (totalRevenue) => {
    const kplc = totalRevenue * 0.9; // 90%
    const remaining = totalRevenue * 0.1; // 10%
    const siMaxis = remaining * 0.85; // 85% of 10%
    const esperanza = remaining * 0.15; // 15% of 10%
    return { kplc, siMaxis, esperanza };
};
const getAllPayments = async ({ searchTerm = "", page = 1, limit = 10, exportAll = false, startDate = "", endDate = "", } = {}) => {
    const where = {};
    if (searchTerm) {
        where[sequelize_1.Op.or] = [
            { meter_number: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            { phone_number: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            { payment_code: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
        ];
    }
    if (startDate || endDate) {
        const paymentDateFilter = {};
        if (startDate) {
            paymentDateFilter[sequelize_1.Op.gte] = new Date(`${startDate}T00:00:00.000Z`);
        }
        if (endDate) {
            paymentDateFilter[sequelize_1.Op.lte] = new Date(`${endDate}T23:59:59.999Z`);
        }
        where.payment_date = paymentDateFilter;
    }
    const offset = (page - 1) * limit;
    const payments = await models_1.Payment.findAndCountAll({
        where,
        order: [["created_at", "DESC"]],
        ...(exportAll ? {} : { limit, offset }),
    });
    return payments;
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
    return dailyRevenue.map((item) => {
        const totalRev = parseFloat(item.revenue) || 0;
        const dataYear = new Date(item.date).getFullYear();
        const split = dataYear >= 2025 ? calculateRevenueSplit(totalRev) : { kplc: 0, siMaxis: 0, esperanza: 0 };
        return {
            period: item.day.toString(),
            revenue: totalRev,
            date: item.date,
            kplc: split.kplc,
            siMaxis: split.siMaxis,
            esperanza: split.esperanza,
        };
    });
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
    return monthlyRevenue.map((item) => {
        const totalRev = parseFloat(item.revenue) || 0;
        const dataYear = parseInt(item.date.substring(0, 4));
        const split = dataYear >= 2025 ? calculateRevenueSplit(totalRev) : { kplc: 0, siMaxis: 0, esperanza: 0 };
        return {
            period: months[parseInt(item.month) - 1],
            revenue: totalRev,
            date: item.date,
            kplc: split.kplc,
            siMaxis: split.siMaxis,
            esperanza: split.esperanza,
        };
    });
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
    return yearlyRevenue.map((item) => {
        const totalRev = parseFloat(item.revenue) || 0;
        const split = item.year >= 2025 ? calculateRevenueSplit(totalRev) : { kplc: 0, siMaxis: 0, esperanza: 0 };
        return {
            period: item.year.toString(),
            revenue: totalRev,
            date: item.year.toString(),
            kplc: split.kplc,
            siMaxis: split.siMaxis,
            esperanza: split.esperanza,
        };
    });
};
module.exports = {
    create,
    getAllPayments,
    getPaymentByMpesaCode,
    getDailyRevenue,
    getMonthlyRevenue,
    getYearlyRevenue,
};
