import httpStatus from "http-status";
import { Request, Response } from "express";
import { counties } from "../utils/counties";

const getCounties = async (req: Request, res: Response) => {
  try {
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      counties,
    });
  } catch (error: any) {
    console.error("Error fetching counties:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

export = { getCounties };
