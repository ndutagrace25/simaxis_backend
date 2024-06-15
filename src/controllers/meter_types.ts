import httpStatus from "http-status";
import meterTypesQueries from "../queries/meter_types";
import { Request, Response } from "express";

const getMeterTypes = async (req: Request, res: Response) => {
  try {
    const meter_types = await meterTypesQueries.getAllMeterTypes();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      meter_types,
    });
  } catch (error: any) {
    console.error("Error fetching meter_types:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

export = { getMeterTypes };
