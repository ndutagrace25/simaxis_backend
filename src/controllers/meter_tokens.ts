import httpStatus from "http-status";
import meterTokensQueries from "../queries/meter_tokens";
import meterQueries from "../queries/meter";
import websiteTokenChecksQueries from "../queries/website_token_checks";
import { Request, Response } from "express";
import { cleanPhone } from "../utils";
import axios from "axios";
import moment from "moment";
import logging from "npmlog";
const sms_config = require("../config/config").sms;

// Meter numbers are the only factor for this public lookup, so it is
// restricted to exactly 11 digits and rate-limited per IP
// (see publicTokenLookupLimiter) to slow down enumeration attempts.
const METER_NUMBER_PATTERN = /^[0-9]{11}$/;

const getMeterTokens = async (req: Request, res: Response) => {
  const meter_id: any = req?.query?.meter_id ? req.query.meter_id : "";
  const start_date: any = req?.query?.start_date ? req.query.start_date : "";
  const end_date: any = req?.query?.end_date ? req.query.end_date : "";
  const page = Math.max(1, Number(req?.query?.page) || 1);
  const limit = Math.max(1, Number(req?.query?.limit) || 10);
  const exportAll = req?.query?.export_all === "true";

  try {
    const { rows: tokens, count: total } =
      await meterTokensQueries.getAllMeterTokens(
        meter_id,
        page,
        limit,
        exportAll,
        start_date,
        end_date
      );

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      tokens,
      total,
      page: exportAll ? 1 : page,
      limit: exportAll ? total : limit,
    });
  } catch (error: any) {
    console.error("Error fetching tokens:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const getMonthlyTokenUsageReport = async (req: Request, res: Response) => {
  const now = new Date();
  const month = Math.max(
    1,
    Math.min(12, Number(req?.query?.month) || now.getMonth() + 1)
  );
  const year = Number(req?.query?.year) || now.getFullYear();
  const meter_id: any = req?.query?.meter_id ? req.query.meter_id : "";
  const page = Math.max(1, Number(req?.query?.page) || 1);
  const limit = Math.max(1, Number(req?.query?.limit) || 10);
  const exportAll = req?.query?.export_all === "true";

  try {
    const { rows: data, total } =
      await meterTokensQueries.getMonthlyTokenUsageReport(
        month,
        year,
        meter_id,
        page,
        limit,
        exportAll
      );

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      data,
      total,
      page: exportAll ? 1 : page,
      limit: exportAll ? total : limit,
    });
  } catch (error: any) {
    console.error("Error fetching monthly token usage report:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const sendTokensManually = async (req: Request, res: Response) => {
  const { token, token_id, phone, meter_number } = req.body;

  const cleanedPhone = cleanPhone(phone);
  if (!cleanedPhone) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: "Invalid phone number",
    });
  }

  try {
    const meterToken = token_id
      ? await meterTokensQueries.getMeterTokenById(token_id)
      : await meterTokensQueries.getMeterTokenByToken(token);

    if (!meterToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Token details not found",
      });
    }

    const generatedAt = meterToken.issue_date || meterToken.created_at;
    const formattedDate = generatedAt
      ? moment(generatedAt).format("YYYY/MM/D HH:mm")
      : "N/A";
    const units =
      meterToken.total_units !== undefined && meterToken.total_units !== null
        ? meterToken.total_units
        : "N/A";
    const amount =
      meterToken.amount !== undefined && meterToken.amount !== null
        ? meterToken.amount
        : "N/A";

    //send sms
    await axios.post(`${sms_config?.baseUrlOtp}`, {
      apikey: sms_config?.apikey,
      partnerID: sms_config?.partnerID,
      mobile: `${cleanedPhone}`,
      message: `Mtr: ${meter_number}\nToken: ${token}\nDate: ${formattedDate}\nUnits: ${units}\nAmt: ${amount}`,
      shortcode: "SI-MAXIS",
    });

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Tokens sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending tokens manually:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const getLatestTokensForCustomer = async (req: Request, res: Response) => {
  const meter_number = String(req.query.meter_number || "").trim();

  const notFound = () =>
    res.status(httpStatus.NOT_FOUND).json({
      statusCode: httpStatus.NOT_FOUND,
      message: "No matching token found. Please check the meter number.",
    });

  if (!METER_NUMBER_PATTERN.test(meter_number)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: "A valid 11-digit meter_number is required",
    });
  }

  websiteTokenChecksQueries.create(meter_number).catch((error: any) => {
    console.error("Error logging website token check:", error);
  });

  try {
    const meter = await meterQueries.getMeterBySerialNumber(
      Number(meter_number)
    );

    if (!meter) {
      logging.warn(
        "public-token-lookup",
        `No meter match for meter ${meter_number} from ip ${req.ip}`
      );
      return notFound();
    }

    const meterTokens = await meterTokensQueries.getLatestTokensForMeter(
      meter.get("id") as string,
      3
    );

    if (!meterTokens.length) {
      logging.warn(
        "public-token-lookup",
        `Meter matched but no tokens found for meter ${meter_number} from ip ${req.ip}`
      );
      return notFound();
    }

    const tokens = meterTokens.map((meterToken) => ({
      token: meterToken.get("token"),
      amount: meterToken.get("amount"),
      units: meterToken.get("total_units"),
      date_generated:
        meterToken.get("issue_date") || meterToken.get("created_at"),
    }));

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      meter_number,
      tokens,
    });
  } catch (error: any) {
    console.error("Error fetching public token lookup:", error);
    return notFound();
  }
};

export = {
  getMeterTokens,
  sendTokensManually,
  getLatestTokensForCustomer,
  getMonthlyTokenUsageReport,
};
