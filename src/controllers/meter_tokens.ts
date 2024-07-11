import httpStatus from "http-status";
import meterTokensQueries from "../queries/meter_tokens";
import { Request, Response } from "express";

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

export = { getMeterTokens };
