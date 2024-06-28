import httpStatus from "http-status";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import customerMeterQueries from "../queries/customer_meters";
import paymentsQueries from "../queries/payments";
import tokensQueries from "../queries/meter_tokens";
import { PaymentAttributes } from "../models/payments";
import axios from "axios";
import moment from "moment";

const stron_config = require("../config/config").stron;
const sms_config = require("../config/config").sms;

const paymentCallback = async (req: Request, res: Response) => {
  const { meter_number, meter_id } = req.query;
  const { Body } = req.body;

  let mpesaCode: any;

  // get customer meter by meter_id
  const customer_meter: any =
    await customerMeterQueries.getCustomerMeterByMeterId(
      // @ts-ignore
      meter_id
    );

  if (Body?.stkCallback?.ResultCode !== 0) {
    mpesaCode = { Value: "Request Cancelled" };

    let failedData: PaymentAttributes = {
      payment_code: mpesaCode?.Value,
      payment_date: new Date(),
      amount: 0,
      id: uuidv4(),
      payment_method: "MPESA",
      customer_id: customer_meter?.customer_id,
      // @ts-ignore
      meter_number,
      // @ts-ignore
      meter_id,
    };
    try {
      const paymentSaved = await paymentsQueries.create(failedData);
      return res.status(httpStatus.OK).json({
        statusCode: httpStatus.OK,
        paymentSaved,
      });
    } catch (error: any) {
      console.log(error.message);
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  } else {
    mpesaCode = Body?.stkCallback?.CallbackMetadata?.Item.find(
      (x: any) => x.Name === "MpesaReceiptNumber"
    );
    let phone_number: any = Body?.stkCallback?.CallbackMetadata?.Item.find(
      (x: any) => x.Name === "PhoneNumber"
    );
    let amount: any = Body?.stkCallback?.CallbackMetadata?.Item.find(
      (x: any) => x.Name === "Amount"
    );

    console.log(meter_number, "meter_number");

    // payment details
    let data: PaymentAttributes = {
      phone_number: phone_number?.Value,
      payment_code: mpesaCode?.Value,
      amount: amount?.Value,
      payment_date: new Date(),
      id: uuidv4(),
      payment_method: "MPESA",
      customer_id: customer_meter?.customer_id,
      // @ts-ignore
      meter_number,
      // @ts-ignore
      meter_id,
    };
    try {
      let paymentSaved: any;
      let stronToken: any;
      const paymentCodeExists = await paymentsQueries.getPaymentByMpesaCode(
        mpesaCode?.Value
      );
      console.log(paymentCodeExists?.payment_code, "getting here 1");

      if (!paymentCodeExists?.payment_code) {
        console.log(paymentCodeExists?.payment_code, "getting here");
        paymentSaved = await paymentsQueries.create(data);
        stronToken = await axios.post(`${stron_config.baseUrl}/VendingMeter`, {
          CompanyName: stron_config.CompanyName,
          UserName: stron_config.UserName,
          PassWord: stron_config.PassWord,
          MeterId: meter_number,
          is_vend_by_unit: "false",
          Amount: amount?.Value,
        });

        if (stronToken?.data?.length > 0) {
          let token = stronToken?.data[0];
          // save token
          let tokenData: any = {
            token: token?.Token,
            meter_id,
            issue_date: new Date(),
            amount: amount?.Value,
            token_type: "Energy Meter",
            total_units: token?.Total_unit,
            id: uuidv4(),
          };

          await tokensQueries.create(tokenData);

          // send sms
          await axios.post(`${sms_config?.baseUrl}`, {
            apikey: sms_config?.apikey,
            partnerID: sms_config?.partnerID,
            mobile: `+${phone_number?.Value}`,
            message: `Mtr:${meter_number}
            Token:${token?.Token}
            Date:${moment(new Date()).format("YYYYMMDD HH:mm")}
            Units:${token?.Total_unit}
            Amt:${amount?.Value}`,
            shortcode: "SI-MAXIS",
          });
        }
      }

      // [
      //   {
      //     Company_name: "SI-MAXIS",
      //     Username: "SimonMuiruri",
      //     Customer_id: "CTS-251966",
      //     Customer_name: "Grace Landlord",
      //     Customer_address: "Kikuyu",
      //     Customer_phone: "+254708807405",
      //     Meter_id: "12345678946",
      //     Meter_type: "Energy Meter",
      //     Total_paid: "100",
      //     Total_unit: "2.7",
      //     Unit: "kWh",
      //     Price: "35.00",
      //     Price_unit: "KES",
      //     Price_Categories: "Domestic",
      //     Rate: "5.600",
      //     Token: "2199 7924 1172 8374 6322",
      //     Gen_time: "2024.06.25",
      //   }
      // ];
      // send sms
      return res.status(httpStatus.OK).json({
        statusCode: httpStatus.OK,
        paymentSaved,
        stronToken,
      });
    } catch (error: any) {
      console.log(error.message, error.response, "2");
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // {
  //   stkCallback: {
  //     MerchantRequestID: '1a9f-4ee1-b033-23e08eb44e5d12867554',
  //     CheckoutRequestID: 'ws_CO_24062024221042139708807403',    ResultCode: 0,
  //     ResultDesc: 'The service request is processed successfully.',
  //     CallbackMetadata: { Item: [
  //       { Name: 'Amount', Value: 1 },
  //       { Name: 'MpesaReceiptNumber', Value: 'SFO2JO4MPS' },
  //       { Name: 'Balance' },
  //       { Name: 'TransactionDate', Value: 20240624221426 },
  //       { Name: 'PhoneNumber', Value: 254708807403 }
  //     ] }
  //   }
  // }
};

const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await paymentsQueries.getAllPayments();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      payments,
    });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const mpesaConfirmation = async (req: Request, res: Response) => {
  console.log(req.body);
  return res.status(httpStatus.OK).json({ message: "Confirmed" });
};

const mpesaValidation = async (req: Request, res: Response) => {
  console.log(req.body);
  return res.status(httpStatus.OK).json({ message: "Validation" });
};

export = {
  getAllPayments,
  mpesaConfirmation,
  mpesaValidation,
  paymentCallback,
};
