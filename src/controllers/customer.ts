import httpStatus from "http-status";
import customerQueries from "../queries/customer";
import { Request, Response } from "express";

const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await customerQueries.getAllCustomers();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      customers,
    });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_verified } = req.body;
  try {
    const customer = await customerQueries.update(id, { is_verified });
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

export = { getCustomers, updateCustomer };
