import httpStatus from "http-status";
import meterQueries from "../queries/meter";
import { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";

const config = require("../config/config").stron;

const getAllMeters = async (req: Request, res: Response) => {
  const keyword: any = req?.query?.keyword ? req.query.keyword : "";
  try {
    const meters = await meterQueries.getAllMeters(keyword);
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
      errors: error.errors,
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
        message: "Meter not found",
      });
    }

    const response = await axios.post(`${config.baseUrl}/NewMeter`, {
      CompanyName: config.CompanyName,
      UserName: config.UserName,
      PassWord: config.PassWord,
      MeterID: meter.dataValues.serial_number,
      MeterType: meter?.dataValues?.MeterType?.dataValues?.type,
    });

    if (
      response.status === 200 &&
      (response.data === "Meter ID already exists!" ||
        response.data === "false")
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message:
          response.data === "false"
            ? "You are trying to forward an invalid meter number"
            : response.data,
      });
    }

    // update the meter
    const updatedMeter = await meterQueries.update(id, {
      is_synced_to_stron: true,
    });

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Meter saved to Stron successfully",
      meter: updatedMeter,
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

const getSyncedAndAttachedMeters = async (req: Request, res: Response) => {
  try {
    const synced_meters = await meterQueries.getSyncedMeters();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      synced_meters,
    });
  } catch (error: any) {
    console.error("Error fetching synced_meters:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const clearMeterTamper = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const meter = await meterQueries.getMeterById(id);

    if (!meter) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Meter not found",
      });
    }

    const response = await axios.post(`${config.baseUrl}/ClearTamperDirectly`, {
      CompanyName: config.CompanyName,
      UserName: config.UserName,
      PassWord: config.PassWord,
      METER_ID: meter.dataValues.serial_number,
    });

    if (response.data === "false01") {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message:
          "Meter tamper not cleared, ensure the meter exists in stron system",
        stron_status: response.data,
      });
    } else {
      // update the meter
      const updatedMeter = await meterQueries.update(id, {
        tamper_value: response.data,
      });

      return res.status(httpStatus.OK).json({
        statusCode: httpStatus.OK,
        message: "Meter tamper cleared successfully",
        meter: updatedMeter,
        stron_status: response.data,
      });
    }
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      error: error.errors,
    });
  }
};

const clearMeterCredit = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const meter = await meterQueries.getMeterById(id);

    if (!meter) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Meter not found",
      });
    }

    const response = await axios.post(`${config.baseUrl}/ClearCreditDirectly`, {
      CompanyName: config.CompanyName,
      UserName: config.UserName,
      PassWord: config.PassWord,
      METER_ID: meter.dataValues.serial_number,
    });

    if (response.data === "false01" || response.data === "false") {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message:
          "Meter credit not cleared, ensure the meter exists in stron system",
        stron_status: response.data,
      });
    } else {
      // update the meter
      const updatedMeter = await meterQueries.update(id, {
        credit_value: response.data,
      });

      return res.status(httpStatus.OK).json({
        statusCode: httpStatus.OK,
        message: "Meter credit cleared successfully",
        meter: updatedMeter,
        stron_status: response.data,
      });
    }
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      error: error.errors,
    });
  }
};

export = {
  createMeter,
  clearMeterCredit,
  clearMeterTamper,
  getAllMeters,
  getSyncedAndAttachedMeters,
  syncMeterToStron,
  updateMeter,
};
