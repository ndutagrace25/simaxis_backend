import httpStatus from "http-status";
import meterTokensQueries from "../queries/meter_tokens";
import { Request, Response } from "express";
import { cleanPhone } from "../utils";
import axios from "axios";
import moment from "moment";
const sms_config = require("../config/config").sms;

const getMeterTokens = async (req: Request, res: Response) => {
  const meter_id: any = req?.query?.meter_id ? req.query.meter_id : "";
  try {
    const tokens = await meterTokensQueries.getAllMeterTokens(meter_id);
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      tokens,
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

export = { getMeterTokens, sendTokensManually };
