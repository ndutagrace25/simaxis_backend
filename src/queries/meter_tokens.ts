import { MeterToken } from "../models";

const getAllMeterTokens = async () => {
  const meters = await MeterToken.findAll({
    order: [["created_at", "DESC"]],
  });
  return meters;
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
};
