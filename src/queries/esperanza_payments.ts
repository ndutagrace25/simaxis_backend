import { Op } from "sequelize";
import { Customer, EsperanzaPayment, User } from "../models";

const userInclude = (as: "creator" | "updater") => ({
  model: User,
  as,
  attributes: ["id", "username"],
  include: [{ model: Customer, attributes: ["first_name", "last_name"] }],
});
const withUsers = [userInclude("creator"), userInclude("updater")];

interface EsperanzaPaymentFilters {
  searchTerm?: string;
  page?: number;
  limit?: number;
  exportAll?: boolean;
  startDate?: string;
  endDate?: string;
}

const getAll = async ({
  searchTerm = "",
  page = 1,
  limit = 10,
  exportAll = false,
  startDate = "",
  endDate = "",
}: EsperanzaPaymentFilters = {}) => {
  const where: any = {};

  if (searchTerm) {
    where[Op.or] = [
      { reference: { [Op.iLike]: `%${searchTerm}%` } },
      { payment_mode: { [Op.iLike]: `%${searchTerm}%` } },
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
  return EsperanzaPayment.findAndCountAll({
    where,
    include: withUsers,
    distinct: true,
    order: [["payment_date", "DESC"]],
    ...(exportAll ? {} : { limit, offset }),
  });
};

// Sum of all payments made to Esperanza to date
const getTotalPaid = async (): Promise<number> => {
  const total = await EsperanzaPayment.sum("amount");
  return Number(total) || 0;
};

const getById = async (id: string) => {
  return EsperanzaPayment.findByPk(id, { include: withUsers });
};

const create = async (details: {
  payment_date: Date;
  amount: number;
  payment_mode: string;
  reference?: string;
  created_by?: string;
  updated_by?: string;
}) => {
  return EsperanzaPayment.create(details);
};

const update = async (
  id: string,
  details: {
    payment_date?: Date;
    amount?: number;
    payment_mode?: string;
    reference?: string;
    updated_by?: string;
  }
) => {
  const payment = await EsperanzaPayment.findByPk(id);
  if (!payment) return null;
  return payment.update({ ...details, updated_at: new Date() });
};

const remove = async (id: string) => {
  return EsperanzaPayment.destroy({ where: { id } });
};

export = {
  getAll,
  getTotalPaid,
  getById,
  create,
  update,
  remove,
};
