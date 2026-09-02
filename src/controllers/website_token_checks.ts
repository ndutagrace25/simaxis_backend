import httpStatus from "http-status";
import websiteTokenChecksQueries from "../queries/website_token_checks";
import { Request, Response } from "express";

const getWebsiteTokenCheckSummary = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req?.query?.page) || 1);
  const limit = Math.max(1, Number(req?.query?.limit) || 10);
  const exportAll = req?.query?.export_all === "true";

  try {
    const { rows: data, total } =
      await websiteTokenChecksQueries.getWebsiteTokenCheckSummary(
        page,
        limit,
        exportAll
      );

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      data,
      total,
      page: exportAll ? 1 : page,
      limit: exportAll ? total : limit,
    });
  } catch (error: any) {
    console.error("Error fetching website token check summary:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

export = {
  getWebsiteTokenCheckSummary,
};
