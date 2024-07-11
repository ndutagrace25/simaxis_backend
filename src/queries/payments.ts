import { Payment } from "../models";
import { Op } from "sequelize";

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
export = {
  create,
  getAllPayments,
  getPaymentByMpesaCode,
};
