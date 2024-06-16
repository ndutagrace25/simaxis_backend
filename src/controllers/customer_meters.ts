import httpStatus from "http-status";
import customerMetersQueries from "../queries/customer_meters";
import { Request, Response } from "express";

const getCustomerMeters = async (req: Request, res: Response) => {
  try {
    const customer_meters = await customerMetersQueries.getAllCustomerMeters();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      customer_meters,
    });
  } catch (error: any) {
    console.error("Error fetching customer_meters:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

export = { getCustomerMeters };
