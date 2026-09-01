import { Op, QueryTypes } from "sequelize";
import { Meter, MeterToken, sequelize } from "../models";
import moment from "moment";

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

// There is no direct FK between meter_tokens and payments (a token is
// created in the same request that saves the payment, using the same
// meter_id/amount). Correlate by matching those and picking the token
// whose created_at is closest to the payment's date.
const getLatestTokensForMeter = async (meter_id: string, limit = 3) => {
  const tokens = await MeterToken.findAll({
    where: { meter_id },
    order: [["created_at", "DESC"]],
    limit,
  });

  return tokens;
};

const getTokenForPayment = async (
  meter_id: string,
  amount: number,
  payment_date?: Date | null
) => {
  const candidates = await MeterToken.findAll({
    where: { meter_id, amount },
    order: [["created_at", "DESC"]],
  });

  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1 || !payment_date) {
    return candidates[0];
  }

  const referenceTime = new Date(payment_date).getTime();
  return candidates.reduce((closest, current) => {
    const closestDiff = Math.abs(
      new Date(closest.get("created_at") as Date).getTime() - referenceTime
    );
    const currentDiff = Math.abs(
      new Date(current.get("created_at") as Date).getTime() - referenceTime
    );
    return currentDiff < closestDiff ? current : closest;
  });
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

const getMonthlyTokenUsageReport = async (
  month: number,
  year: number,
  meter_id = "",
  page = 1,
  limit = 10,
  exportAll = false
) => {
  const start = moment({ year, month: month - 1, day: 1 }).startOf("month");
  const end = moment({ year, month: month - 1, day: 1 }).endOf("month");
  const offset = (page - 1) * limit;

  const replacements: Record<string, unknown> = {
    start: start.toDate(),
    end: end.toDate(),
    meter_id: meter_id || null,
  };

  const rows = await sequelize.query(
    `SELECT m.id AS meter_id, m.serial_number,
            c.first_name, c.middle_name, c.last_name,
            cm.categories,
            COALESCE(SUM(mt.amount), 0)      AS total_amount,
            COALESCE(SUM(mt.total_units), 0) AS total_units,
            COUNT(mt.id)                     AS token_count
     FROM meters m
     LEFT JOIN meter_tokens mt
            ON mt.meter_id = m.id
           AND mt.created_at BETWEEN :start AND :end
     LEFT JOIN customer_meters cm ON cm.meter_id = m.id
     LEFT JOIN customers c ON c.id = cm.customer_id
     WHERE (:meter_id::uuid IS NULL OR m.id = :meter_id::uuid)
     GROUP BY m.id, m.serial_number, c.first_name, c.middle_name, c.last_name, cm.categories
     ORDER BY total_units DESC
     ${exportAll ? "" : "LIMIT :limit OFFSET :offset"}`,
    {
      replacements: exportAll
        ? replacements
        : { ...replacements, limit, offset },
      type: QueryTypes.SELECT,
    }
  );

  const [{ count }] = await sequelize.query<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM meters m
     WHERE (:meter_id::uuid IS NULL OR m.id = :meter_id::uuid)`,
    {
      replacements: { meter_id: meter_id || null },
      type: QueryTypes.SELECT,
    }
  );

  return { rows, total: Number(count) };
};

export = {
  create,
  getAllMeterTokens,
  getMeterTokenById,
  getMeterTokenByToken,
  getLatestTokensForMeter,
  getTokenForPayment,
  getMonthlyTokenUsageReport,
};
