import httpStatus from "http-status";
import customerMetersQueries from "../queries/customer_meters";
import { Request, Response } from "express";
import axios from "axios";

const config = require("../config/config").stron;

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

const syncCustomerAccountToStron = async (req: Request, res: Response) => {
  const { id, Account_ID, CUST_ID, METER_ID } = req.body;

  try {
    const customer_meter = await customerMetersQueries.getCustomerMeterById(id);

    if (!customer_meter) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Account not found",
      });
    }
    const response = await axios.post(`${config.baseUrl}/NewAccount`, {
      CompanyName: config.CompanyName,
      UserName: config.UserName,
      PassWord: config.PassWord,
      Account_ID,
      CUST_ID,
      METER_ID,
      SStation_ID: "Sta-00001",
      Categories: "Domestic",
    });

    if (
      response.status === 200 &&
      (response.data ===
        "Account ID alreadyis bound to the user. You cannot add this Account ID For a account again!" ||
        response.data === "false" ||
        response.data === "The current meter ID does not exist in the system" ||
        response.data ===
          "The current Price Categories does not exist in the system" ||
        response.data === "The current CUST_ID does not exist in the system")
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message:
          response.data === "false"
            ? "You are trying to forward an invalid meter number"
            : response.data,
      });
    }
    // update the customer meter
    const updatedCustomerMeter = await customerMetersQueries.update(id, {
      is_synced_to_stron: true,
    });
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Customer meter saved to Stron successfully",
      customer_meter: updatedCustomerMeter,
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

export = { getCustomerMeters, syncCustomerAccountToStron };
