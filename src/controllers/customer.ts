import httpStatus from "http-status";
import customerQueries from "../queries/customer";
import { Request, Response } from "express";
import axios from "axios";

const config = require("../config/config").stron;

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

const syncCustomerToStron = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const customer = await customerQueries.getCustomerById(id);

    if (!customer) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Customer not found",
      });
    }

    const response = await axios.post(`${config.baseUrl}/NewCustomer`, {
      CompanyName: config.CompanyName,
      UserName: config.UserName,
      PassWord: config.PassWord,
      CustomerID: customer.dataValues.id,
      CustomerAddress: customer.dataValues.location,
      CustomerPhone: customer?.dataValues?.User?.dataValues?.phone,
      CustomerEmail: customer?.dataValues?.User?.dataValues?.email,
      CustomerName:
        customer?.dataValues.first_name + " " + customer?.dataValues.last_name,
    });

    if (
      response.status === 200 &&
      response.data === "The current CUST_ID has exist in the system"
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: response.data,
      });
    }

    // update the customer
    await customerQueries.update(id, {
      is_synced_to_stron: true,
      is_verified: true,
      is_active: true,
    });

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Customer verified and saved to Stron successfully",
      customer,
      stron_status: response.data,
    });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      error: error.errors,
    });
  }
};

export = { getCustomers, syncCustomerToStron, updateCustomer };
