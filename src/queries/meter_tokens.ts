import { Op } from "sequelize";
import { Meter, MeterToken } from "../models";

const getAllMeterTokens = async (
  meter_id = "",
  page = 1,
  limit = 10,
  exportAll = false,
  start_date = "",
  end_date = ""
) => {
  const offset = (page - 1) * limit;
  const where: Record<string, unknown> = meter_id ? { meter_id } : {};

  if (start_date || end_date) {
    const createdAtFilter: Record<symbol, Date> = {};

    if (start_date) {
      createdAtFilter[Op.gte] = new Date(`${start_date}T00:00:00.000Z`);
    }

    if (end_date) {
      createdAtFilter[Op.lte] = new Date(`${end_date}T23:59:59.999Z`);
    }

    where.created_at = createdAtFilter;
  }

  const tokens = await MeterToken.findAndCountAll({
    where,
    include: [
      {
        model: Meter,
        attributes: ["serial_number"],
      },
    ],
    order: [["created_at", "DESC"]],
    ...(exportAll ? {} : { limit, offset }),
    distinct: true,
  });
  return tokens;
};

const getMeterTokenById = async (id: string) => {
  const token = await MeterToken.findOne({ where: { id } });
  return token;
};

const getMeterTokenByToken = async (token: string) => {
  const meterToken = await MeterToken.findOne({ where: { token } });
  return meterToken;
};

const create = async (tokenDetails: {
  id: string;
  token: string;
  meter_id: string;
  amount: number;
  issue_date?: Date;
  token_type?: string;
  total_units?: number;
}) => {
  const token = await MeterToken.create(tokenDetails);

  return token;
};

export = {
  create,
  getAllMeterTokens,
  getMeterTokenById,
  getMeterTokenByToken,
};
