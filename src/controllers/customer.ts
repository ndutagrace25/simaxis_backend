import httpStatus from "http-status";
import customerQueries from "../queries/customer";
import customerMeterQueries from "../queries/customer_meters";
import { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

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
      message: "Customer verified successfully",
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
      CustomerID: `CTS-${customer.dataValues.customer_number}`,
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
      is_active: true,
    });

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Customer saved to Stron successfully",
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

const getLandlords = async (req: Request, res: Response) => {
  try {
    const landlords = await customerQueries.getAllLandlords();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      landlords,
    });
  } catch (error: any) {
    console.error("Error fetching landlords:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const attachMeterToCustomer = async (req: Request, res: Response) => {
  const { meter_id, customer_id } = req.body;
  try {
    //get customer meter by meter_id
    const meterAttached = await customerMeterQueries.getCustomerMeterByMeterId(
      meter_id
    );

    if (meterAttached) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "The meter number is already attached to an agent/landlord",
      });
    }

    const customer_meter = await customerMeterQueries.create({
      id: uuidv4(),
      meter_id,
      customer_id,
    });
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Meter attached successfully",
      customer_meter,
    });
  } catch (error: any) {
    console.error("Error attaching meter to customer:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

export = {
  attachMeterToCustomer,
  getCustomers,
  getLandlords,
  syncCustomerToStron,
  updateCustomer,
};
