import httpStatus from "http-status";
import meterTokensQueries from "../queries/meter_tokens";
import { Request, Response } from "express";
import { cleanPhone } from "../utils";
import axios from "axios";
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
  const { token, phone, meter_number } = req.body;

  const cleanedPhone = cleanPhone(phone);
  if (!cleanedPhone) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: "Invalid phone number",
    });
  }

  try {
    //send sms
    await axios.post(`${sms_config?.baseUrlOtp}`, {
      apikey: sms_config?.apikey,
      partnerID: sms_config?.partnerID,
      mobile: `${cleanedPhone}`,
      message: `Mtr: ${meter_number}\nToken: ${token}`,
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
