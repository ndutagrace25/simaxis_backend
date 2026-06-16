import { Meter, MeterToken } from "../models";

const getAllMeterTokens = async (meter_id = "") => {
  const tokens = await MeterToken.findAll({
    where: meter_id ? { meter_id } : {},
    include: [
      {
        model: Meter,
        attributes: ["serial_number"],
      },
    ],
    order: [["created_at", "DESC"]],
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
