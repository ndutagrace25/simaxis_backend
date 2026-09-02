import { QueryTypes } from "sequelize";
import { WebsiteTokenCheck, sequelize } from "../models";

const create = async (meter_number: string) => {
  const check = await WebsiteTokenCheck.create({ meter_number });

  return check;
};

const getWebsiteTokenCheckSummary = async (
  page = 1,
  limit = 10,
  exportAll = false
) => {
  const offset = (page - 1) * limit;

  const rows = await sequelize.query(
    `SELECT meter_number,
            COUNT(*)          AS number_of_checks,
            MAX(created_at)   AS last_check
     FROM website_token_checks
     GROUP BY meter_number
     ORDER BY last_check DESC
     ${exportAll ? "" : "LIMIT :limit OFFSET :offset"}`,
    {
      replacements: exportAll ? {} : { limit, offset },
      type: QueryTypes.SELECT,
    }
  );

  const [{ count }] = await sequelize.query<{ count: string }>(
    `SELECT COUNT(DISTINCT meter_number)::int AS count FROM website_token_checks`,
    { type: QueryTypes.SELECT }
  );

  return { rows, total: Number(count) };
};

export = {
  create,
  getWebsiteTokenCheckSummary,
};
