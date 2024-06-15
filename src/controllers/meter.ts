import httpStatus from "http-status";
import meterQueries from "../queries/meter";
import { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { validationResult, ValidationError } from "express-validator";

const config = require("../config/config").stron;

const getAllMeters = async (req: Request, res: Response) => {
  try {
    const meters = await meterQueries.getAllMeters();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      meters,
    });
  } catch (error: any) {
    console.error("Error fetching meters:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

// create a new meter
const createMeter = async (req: Request, res: Response) => {
  const errors: any = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: errors.errors[0]?.msg,
    });
  }

  const { meter_type_id, serial_number, county_number } = req.body;

  let data = {
    id: uuidv4(),
    meter_type_id,
    serial_number,
    county_number,
  };


  try {
    const meterExists = await meterQueries.getMeterBySerialNumber(
      serial_number
    );

    if (meterExists) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "The meter you are trying to add already exists",
      });
    }
    const meter = await meterQueries.create(data);

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Meter saved successfully",
      meter,
    });
  } catch (error: any) {
    console.error("Error saving", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      errors: error.errors
    });
  }
};

const updateMeter = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_synced_to_stron } = req.body;
  try {
    const meter = await meterQueries.update(id, { is_synced_to_stron });
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Meter updated successfully",
      meter,
    });
  } catch (error: any) {
    console.error("Error updating meter:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const syncMeterToStron = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const meter = await meterQueries.getMeterById(id);

    if (!meter) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Customer not found",
      });
    }

    // const response = await axios.post(`${config.baseUrl}/NewCustomer`, {
    //   CompanyName: config.CompanyName,
    //   UserName: config.UserName,
    //   PassWord: config.PassWord,
    //   CustomerID: meter.dataValues.id,
    //   CustomerAddress: meter.dataValues.location,
    //   CustomerPhone: meter?.dataValues?.User?.dataValues?.phone,
    //   CustomerEmail: meter?.dataValues?.User?.dataValues?.email,
    //   CustomerName:
    //     meter?.dataValues.first_name + " " + meter?.dataValues.last_name,
    // });

    // if (
    //   response.status === 200 &&
    //   response.data === "The current CUST_ID has exist in the system"
    // ) {
    //   return res.status(httpStatus.BAD_REQUEST).json({
    //     statusCode: httpStatus.BAD_REQUEST,
    //     message: response.data,
    //   });
    // }

    // update the customer
    await meterQueries.update(id, {
      is_synced_to_stron: true,
    });

    // return res.status(httpStatus.OK).json({
    //   statusCode: httpStatus.OK,
    //   message: "Customer verified and saved to Stron successfully",
    //   customer,
    //   stron_status: response.data,
    // });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      error: error.errors,
    });
  }
};

export = { createMeter, getAllMeters, syncMeterToStron, updateMeter };
