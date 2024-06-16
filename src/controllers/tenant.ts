import httpStatus from "http-status";
import tenantsQueries from "../queries/tenants";
import { Request, Response } from "express";

const getTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await tenantsQueries.getAllTenants();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      tenants,
    });
  } catch (error: any) {
    console.error("Error fetching tenants:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

export = { getTenants };
