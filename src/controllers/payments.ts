import httpStatus from "http-status";
import { Request, Response } from "express";

const paymentCallback = async (req: Request, res: Response) => {
  const { Body } = req.body;
  let mpesaCode;
  if (Body?.stkCallback?.ResultCode !== 0) {
    mpesaCode = { Value: "Request Cancelled" };
  } else {
    mpesaCode = Body?.stkCallback?.CallbackMetadata?.Item.find(
      (x: any) => x.Name === "MpesaReceiptNumber"
    );
  }

  return res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    mpesaCode: mpesaCode,
  });
};

export = { paymentCallback };
