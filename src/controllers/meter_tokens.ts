import httpStatus from "http-status";
import meterTokensQueries from "../queries/meter_tokens";
import paymentsQueries from "../queries/payments";
import { Request, Response } from "express";
import { cleanPhone } from "../utils";
import axios from "axios";
import moment from "moment";
import logging from "npmlog";
const sms_config = require("../config/config").sms;

// Meter numbers are sequential/guessable, so this public endpoint requires
// the payment_code too (the M-Pesa receipt code from the customer's
// confirmation SMS) as a second factor only the payer would have.
const METER_NUMBER_PATTERN = /^[0-9]{1,20}$/;
const PAYMENT_CODE_PATTERN = /^[A-Za-z0-9]{1,20}$/;

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

const getLastTokenForCustomer = async (req: Request, res: Response) => {
  const meter_number = String(req.query.meter_number || "").trim();
  const payment_code = String(req.query.payment_code || "").trim();

  const notFound = () =>
    res.status(httpStatus.NOT_FOUND).json({
      statusCode: httpStatus.NOT_FOUND,
      message:
        "No matching token found. Please check the meter number and payment code.",
    });

  if (
    !METER_NUMBER_PATTERN.test(meter_number) ||
    !PAYMENT_CODE_PATTERN.test(payment_code)
  ) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: "A valid meter_number and payment_code are both required",
    });
  }

  try {
    const payment = await paymentsQueries.getPaymentByMeterNumberAndCode(
      meter_number,
      payment_code
    );

    if (!payment) {
      logging.warn(
        "public-token-lookup",
        `No payment match for meter ${meter_number} from ip ${req.ip}`
      );
      return notFound();
    }

    const meterToken = await meterTokensQueries.getTokenForPayment(
      payment.get("meter_id") as string,
      payment.get("amount") as number,
      payment.get("payment_date") as Date
    );

    if (!meterToken) {
      logging.warn(
        "public-token-lookup",
        `Payment matched but no token found for meter ${meter_number} from ip ${req.ip}`
      );
      return notFound();
    }

    const dateGenerated =
      meterToken.get("issue_date") || meterToken.get("created_at");

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      meter_number,
      token: meterToken.get("token"),
      amount: meterToken.get("amount"),
      units: meterToken.get("total_units"),
      date_generated: dateGenerated,
    });
  } catch (error: any) {
    console.error("Error fetching public token lookup:", error);
    return notFound();
  }
};

export = { getMeterTokens, sendTokensManually, getLastTokenForCustomer };
