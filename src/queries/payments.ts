import { Payment } from "../models";
import { Op, fn, col, literal } from "sequelize";

// Types for API responses
interface RevenueDataPoint {
  period: string;
  revenue: number;
  date: string;
}

const getAllPayments = async (searchTerm = "") => {
  const searchCondition = {
    [Op.or]: [
      { meter_number: { [Op.iLike]: `%${searchTerm}%` } },
      { phone_number: { [Op.iLike]: `%${searchTerm}%` } },
      { payment_code: { [Op.iLike]: `%${searchTerm}%` } },
    ],
  };
  const meters = await Payment.findAll({
    where: searchTerm ? searchCondition : {},
    order: [["created_at", "DESC"]],
  });
  return meters;
};

const create = async (paymentDetails: {
  id: string;
  phone_number?: string;
  payment_code?: string;
  amount: number;
  payment_date?: Date;
  payment_method?: string;
  customer_id: string;
  meter_number?: string;
  meter_id: string;
}) => {
  const meter = await Payment.create(paymentDetails);

  return meter;
};

const getPaymentByMpesaCode = async (payment_code: string) => {
  const payment = await Payment.findOne({
    where: { payment_code },
  });

  return payment;
};

// Get daily revenue for a specific month
const getDailyRevenue = async (
  year: number,
  month: number
): Promise<RevenueDataPoint[]> => {
  // Month is 1-based (1 = January, 12 = December)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  const dailyRevenue = await Payment.findAll({
    attributes: [
      [fn("DATE", col("created_at")), "date"],
      [fn("SUM", col("amount")), "revenue"],
      [fn("EXTRACT", literal("DAY FROM created_at")), "day"],
    ],
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },
    group: [
      fn("DATE", col("created_at")),
      fn("EXTRACT", literal("DAY FROM created_at")),
    ],
    order: [[fn("DATE", col("created_at")), "ASC"]],
    raw: true,
  });

  return dailyRevenue.map((item: any) => ({
    period: item.day.toString(),
    revenue: parseFloat(item.revenue) || 0,
    date: item.date,
  }));
};

// Get monthly revenue for a specific year
const getMonthlyRevenue = async (year: number): Promise<RevenueDataPoint[]> => {
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st

  const monthlyRevenue = await Payment.findAll({
    attributes: [
      [fn("EXTRACT", literal("MONTH FROM created_at")), "month"],
      [fn("SUM", col("amount")), "revenue"],
      [fn("TO_CHAR", col("created_at"), "YYYY-MM"), "date"],
    ],
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },
    group: [
      fn("EXTRACT", literal("MONTH FROM created_at")),
      fn("TO_CHAR", col("created_at"), "YYYY-MM"),
    ],
    order: [[fn("EXTRACT", literal("MONTH FROM created_at")), "ASC"]],
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

  return monthlyRevenue.map((item: any) => ({
    period: months[parseInt(item.month) - 1],
    revenue: parseFloat(item.revenue) || 0,
    date: item.date,
  }));
};

// Get yearly revenue for the last N years
const getYearlyRevenue = async (
  yearsBack: number = 5
): Promise<RevenueDataPoint[]> => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearsBack + 1;
  const startDate = new Date(startYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

  const yearlyRevenue = await Payment.findAll({
    attributes: [
      [fn("EXTRACT", literal("YEAR FROM created_at")), "year"],
      [fn("SUM", col("amount")), "revenue"],
    ],
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },
    group: [fn("EXTRACT", literal("YEAR FROM created_at"))],
    order: [[fn("EXTRACT", literal("YEAR FROM created_at")), "ASC"]],
    raw: true,
  });

  return yearlyRevenue.map((item: any) => ({
    period: item.year.toString(),
    revenue: parseFloat(item.revenue) || 0,
    date: item.year.toString(),
  }));
};

export = {
  create,
  getAllPayments,
  getPaymentByMpesaCode,
  getDailyRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
};
