import { Payment } from "../models";
import { Op, fn, col, literal } from "sequelize";

interface PaymentFilters {
  searchTerm?: string;
  page?: number;
  limit?: number;
  exportAll?: boolean;
  startDate?: string;
  endDate?: string;
}

// Types for API responses
interface RevenueDataPoint {
  period: string;
  revenue: number;
  date: string;
  kplc: number;
  siMaxis: number;
  esperanza: number;
}

// Helper function to calculate revenue split
const calculateRevenueSplit = (totalRevenue: number) => {
  const kplc = totalRevenue * 0.9; // 90%
  const remaining = totalRevenue * 0.1; // 10%
  const siMaxis = remaining * 0.85; // 85% of 10%
  const esperanza = remaining * 0.15; // 15% of 10%
  return { kplc, siMaxis, esperanza };
};

const getAllPayments = async ({
  searchTerm = "",
  page = 1,
  limit = 10,
  exportAll = false,
  startDate = "",
  endDate = "",
}: PaymentFilters = {}) => {
  const where: any = {};

  if (searchTerm) {
    where[Op.or] = [
      { meter_number: { [Op.iLike]: `%${searchTerm}%` } },
      { phone_number: { [Op.iLike]: `%${searchTerm}%` } },
      { payment_code: { [Op.iLike]: `%${searchTerm}%` } },
    ];
  }

  if (startDate || endDate) {
    const paymentDateFilter: Record<symbol, Date> = {};

    if (startDate) {
      paymentDateFilter[Op.gte] = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      paymentDateFilter[Op.lte] = new Date(`${endDate}T23:59:59.999Z`);
    }

    where.payment_date = paymentDateFilter;
  }

  const offset = (page - 1) * limit;
  const payments = await Payment.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    ...(exportAll ? {} : { limit, offset }),
  });
  return payments;
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

const getPaymentByMeterNumberAndCode = async (
  meter_number: string,
  payment_code: string
) => {
  const payment = await Payment.findOne({
    where: { meter_number, payment_code },
  });

  return payment;
};

// Get daily revenue for a specific month
const getDailyRevenue = async (
  year: number,
  month: number
): Promise<RevenueDataPoint[]> => {
  // Month is 1-based (1 = January, 12 = December)
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0); // Start of first day
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of last day of the month

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

  return dailyRevenue.map((item: any) => {
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
const getMonthlyRevenue = async (year: number): Promise<RevenueDataPoint[]> => {
  const startDate = new Date(year, 0, 1, 0, 0, 0, 0); // Start of January 1st
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // End of December 31st

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

  return monthlyRevenue.map((item: any) => {
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
const getYearlyRevenue = async (
  yearsBack: number = 5
): Promise<RevenueDataPoint[]> => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearsBack + 1;
  const startDate = new Date(startYear, 0, 1, 0, 0, 0, 0); // Start of first year
  const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); // End of current year

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

  return yearlyRevenue.map((item: any) => {
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

export = {
  create,
  getAllPayments,
  getPaymentByMpesaCode,
  getPaymentByMeterNumberAndCode,
  getDailyRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
};
