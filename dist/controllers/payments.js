"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_1 = __importDefault(require("http-status"));
const uuid_1 = require("uuid");
const customer_meters_1 = __importDefault(require("../queries/customer_meters"));
const payments_1 = __importDefault(require("../queries/payments"));
const meter_tokens_1 = __importDefault(require("../queries/meter_tokens"));
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const meter_1 = __importDefault(require("../queries/meter"));
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const node_cron_1 = __importDefault(require("node-cron"));
const npmlog_1 = __importDefault(require("npmlog"));
const stron_config = require("../config/config").stron;
const sms_config = require("../config/config").sms;
node_cron_1.default.schedule("0 */12 * * *", async () => {
    npmlog_1.default.info("Checking advanta balance", "");
    let balance = await axios_1.default.post(`${sms_config?.mainBaseUrl + `/getbalance/`}`, {
        apikey: sms_config?.apikey,
        partnerID: sms_config?.partnerID,
    });
    let smsObject = {
        partnerID: sms_config?.partnerID,
        apikey: sms_config?.apikey,
        pass_type: "plain",
        clientsmsid: 1234,
        message: `Advanta SMS credit balance is currently at ${balance.data.credit}, consider topping up more credit to avoid SMS failures to SI-MAXIS customers`,
        shortcode: "SI-MAXIS",
    };
    if (balance.data.credit && parseInt(balance.data.credit) < 500) {
        npmlog_1.default.info("SMS is below threshold", balance.data.credit);
        await axios_1.default.post(`${sms_config?.mainBaseUrl + `/sendbulk`}`, {
            count: 1,
            smslist: [
                {
                    ...smsObject,
                    mobile: "+254708807403",
                },
                {
                    ...smsObject,
                    mobile: "+254721863405",
                },
                {
                    ...smsObject,
                    mobile: "+254722164408",
                },
            ],
        });
    }
    else {
        npmlog_1.default.info("SMS Balance", balance.data.credit);
    }
});
const paymentCallback = async (req, res) => {
    const { meter_number, meter_id } = req.query;
    const { Body } = req.body;
    console.log(Body, "getting here");
    let mpesaCode;
    // get customer meter by meter_id
    const customer_meter = await customer_meters_1.default.getCustomerMeterByMeterId(
    // @ts-ignore
    meter_id);
    if (Body?.stkCallback?.ResultCode !== 0) {
        mpesaCode = { Value: "Request Cancelled" };
        let failedData = {
            payment_code: mpesaCode?.Value,
            payment_date: new Date(),
            amount: 0,
            id: (0, uuid_1.v4)(),
            payment_method: "MPESA",
            customer_id: customer_meter?.customer_id,
            // @ts-ignore
            meter_number,
            // @ts-ignore
            meter_id,
        };
        try {
            const paymentSaved = await payments_1.default.create(failedData);
            return res.status(http_status_1.default.OK).json({
                statusCode: http_status_1.default.OK,
                paymentSaved,
            });
        }
        catch (error) {
            console.log(error.message);
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: error.message,
            });
        }
    }
    else {
        mpesaCode = Body?.stkCallback?.CallbackMetadata?.Item.find((x) => x.Name === "MpesaReceiptNumber");
        let phone_number = Body?.stkCallback?.CallbackMetadata?.Item.find((x) => x.Name === "PhoneNumber");
        let amount = Body?.stkCallback?.CallbackMetadata?.Item.find((x) => x.Name === "Amount");
        console.log(meter_number, "meter_number");
        // payment details
        let data = {
            phone_number: phone_number?.Value,
            payment_code: mpesaCode?.Value,
            amount: amount?.Value,
            payment_date: new Date(),
            id: (0, uuid_1.v4)(),
            payment_method: "MPESA",
            customer_id: customer_meter?.customer_id,
            // @ts-ignore
            meter_number,
            // @ts-ignore
            meter_id,
        };
        try {
            let paymentSaved;
            let stronToken;
            const paymentCodeExists = await payments_1.default.getPaymentByMpesaCode(mpesaCode?.Value);
            // console.log(paymentCodeExists?.payment_code, "getting here 1");
            if (!paymentCodeExists?.payment_code) {
                console.log(paymentCodeExists?.payment_code, "getting here");
                paymentSaved = await payments_1.default.create(data);
                stronToken = await axios_1.default.post(`${stron_config.baseUrl}/VendingMeter`, {
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
                    let tokenData = {
                        token: token?.Token,
                        meter_id,
                        issue_date: new Date(),
                        amount: amount?.Value,
                        token_type: "Energy Meter",
                        total_units: token?.Total_unit,
                        id: (0, uuid_1.v4)(),
                    };
                    await meter_tokens_1.default.create(tokenData);
                    // send sms
                    await axios_1.default.post(`${sms_config?.baseUrl}`, {
                        apikey: sms_config?.apikey,
                        partnerID: sms_config?.partnerID,
                        mobile: `+${phone_number?.Value}`,
                        message: `Mtr: ${meter_number}\nToken: ${token?.Token}\nDate: ${(0, moment_1.default)(new Date()).format("YYYYMMDD HH:mm")}\nUnits: ${token?.Total_unit}\nAmt: ${amount?.Value}`,
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
            return res.status(http_status_1.default.OK).json({
                statusCode: http_status_1.default.OK,
                paymentSaved,
                stronToken,
            });
        }
        catch (error) {
            console.log(error.message, error.response, "2");
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
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
const getAllPayments = async (req, res) => {
    const keyword = req?.query?.keyword ? req.query.keyword : "";
    const startDate = req?.query?.start_date ? req.query.start_date : "";
    const endDate = req?.query?.end_date ? req.query.end_date : "";
    const page = Math.max(1, Number(req?.query?.page) || 1);
    const limit = Math.max(1, Number(req?.query?.limit) || 10);
    const exportAll = req?.query?.export_all === "true";
    try {
        const { rows: payments, count: total } = await payments_1.default.getAllPayments({
            searchTerm: keyword,
            page,
            limit,
            exportAll,
            startDate,
            endDate,
        });
        return res.status(http_status_1.default.OK).json({
            statusCode: http_status_1.default.OK,
            payments,
            total,
            page: exportAll ? 1 : page,
            limit: exportAll ? total : limit,
        });
    }
    catch (error) {
        console.error("Error fetching payments:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const mpesaConfirmation = async (req, res) => {
    console.log(req.body.MSISDN, "MSISDN CONFIRMATION");
    if (req.body.BillRefNumber) {
        // get meter by serial number
        const meter = await meter_1.default.getMeterBySerialNumber(req.body.BillRefNumber);
        if (!meter) {
            return res.status(http_status_1.default.OK).json({
                ResultCode: "C2B00012", // invalid account number
                ResultDesc: "Rejected",
            });
        }
        else {
            try {
                const customer_meter = await customer_meters_1.default.getCustomerMeterByMeterId(
                // @ts-ignore
                meter?.dataValues?.id);
                console.log(customer_meter?.dataValues?.is_synced_to_stron);
                // check if the payment is already submited
                const paymentCodeExists = await payments_1.default.getPaymentByMpesaCode(req.body.TransID);
                // console.log(paymentCodeExists)
                if (!paymentCodeExists?.payment_code &&
                    customer_meter?.dataValues?.is_synced_to_stron) {
                    let data = {
                        phone_number: req.body.MSISDN,
                        payment_code: req.body.TransID,
                        amount: req.body.TransAmount,
                        payment_date: new Date(),
                        id: (0, uuid_1.v4)(),
                        payment_method: "MPESA",
                        customer_id: customer_meter?.customer_id,
                        // @ts-ignore
                        meter_number: req.body.BillRefNumber,
                        // @ts-ignore
                        meter_id: meter?.dataValues?.id,
                    };
                    // save payment
                    await payments_1.default.create(data);
                    // send to stron
                    let stronToken = await axios_1.default.post(`http://www.server-newv.stronpower.com/api/VendingMeter`, {
                        CompanyName: stron_config.CompanyName,
                        UserName: stron_config.UserName,
                        PassWord: stron_config.PassWord,
                        MeterId: meter?.serial_number,
                        is_vend_by_unit: "false",
                        Amount: req.body.TransAmount,
                    });
                    if (stronToken?.data?.length > 0) {
                        let token = stronToken?.data[0];
                        // save token
                        let tokenData = {
                            token: token?.Token,
                            meter_id: meter?.id,
                            issue_date: new Date(),
                            amount: req.body.TransAmount,
                            token_type: "Energy Meter",
                            total_units: token?.Total_unit,
                            id: (0, uuid_1.v4)(),
                        };
                        await meter_tokens_1.default.create(tokenData);
                        // send sms
                        await axios_1.default.post(`${sms_config?.baseUrlOtp}`, {
                            apikey: sms_config?.apikey,
                            partnerID: sms_config?.partnerID,
                            mobile: `${req.body.MSISDN}`,
                            message: `Mtr: ${meter?.serial_number}\nToken: ${token?.Token}\nDate: ${(0, moment_1.default)(new Date()).format("YYYY/MM/D HH:mm")}\nUnits: ${token?.Total_unit}\nAmt: ${req.body.TransAmount}`,
                            shortcode: "SI-MAXIS",
                            hashed: true,
                        });
                        console.log("CONFIRMATION SUCCESSFUL");
                        return res.status(http_status_1.default.OK).json({
                            ResultCode: "0",
                            ResultDesc: "Success",
                        });
                    }
                    else {
                        console.log("REJECT 1");
                        return res.status(http_status_1.default.OK).json({
                            ResultCode: "C2B00016",
                            ResultDesc: "Rejected",
                        });
                    }
                }
                else {
                    console.log("REJECT 2");
                    return res.status(http_status_1.default.OK).json({
                        ResultCode: customer_meter?.dataValues?.is_synced_to_stron
                            ? "C2B00016"
                            : "C2B00012",
                        ResultDesc: "Rejected",
                    });
                }
            }
            catch (error) {
                console.log("REJECT 3", error.message);
                return res.status(http_status_1.default.OK).json({
                    ResultCode: "C2B00016",
                    ResultDesc: "Rejected",
                });
            }
        }
    }
    else {
        console.log("CONFIRMATION OTHER ERRORS");
        return res.status(http_status_1.default.OK).json({
            ResultCode: "C2B00016", // other reasons
            ResultDesc: "Rejected",
        });
    }
};
const mpesaValidation = async (req, res) => {
    console.log(req.body.MSISDN, "MSISDN VALIDATION");
    console.log(req.body.BillRefNumber, "req.body.BillRefNumber");
    if (req.body.BillRefNumber) {
        // get meter by serial number
        const meter = await meter_1.default.getMeterBySerialNumber(req.body.BillRefNumber);
        if (!meter) {
            console.log("ACCOUNT METER NOT FOUND");
            return res.status(http_status_1.default.OK).json({
                ResultCode: "C2B00012", // invalid account number
                ResultDesc: "Rejected",
            });
        }
        else {
            console.log("VALIDATION SUCCESSFUL");
            if (meter?.dataValues?.is_synced_to_stron) {
                return res.status(http_status_1.default.OK).json({
                    ResultCode: "0",
                    ResultDesc: "Accepted",
                });
            }
            else {
                return res.status(http_status_1.default.OK).json({
                    ResultCode: "C2B00012", // invalid account number
                    ResultDesc: "Rejected",
                });
            }
        }
    }
    else {
        console.log("VALIDATION OTHER EERORS");
        return res.status(http_status_1.default.OK).json({
            ResultCode: "C2B00016", // other reasons
            ResultDesc: "Rejected",
        });
    }
};
const timeoutUrl = async (req, res) => {
    console.log("GETTING HERE");
    console.log(req.body);
    console.log(req.body?.Result?.ReferenceData);
    return res.status(http_status_1.default.OK).json({ message: "success" });
};
const manualPayment = async (req, res) => {
    const { meter_id, payment_code, phone_number, amount } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: errors.errors[0]?.msg,
        });
    }
    let phone = (0, utils_1.cleanPhone)(phone_number);
    // get customer meter information
    const customer_meter = await customer_meters_1.default.getCustomerMeterByMeterId(meter_id);
    const meter = await meter_1.default.getMeterById(meter_id);
    if (!customer_meter || !meter) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: `Meter number not found!`,
        });
    }
    try {
        let paymentSaved;
        let stronToken;
        let data = {
            phone_number: phone,
            payment_code,
            amount: amount,
            payment_date: new Date(),
            id: (0, uuid_1.v4)(),
            payment_method: "MPESA",
            customer_id: customer_meter?.customer_id,
            // @ts-ignore
            meter_number: meter?.serial_number,
            // @ts-ignore
            meter_id,
            // @ts-ignore
            generated_manually: true,
        };
        const paymentCodeExists = await payments_1.default.getPaymentByMpesaCode(payment_code);
        if (!paymentCodeExists?.payment_code) {
            paymentSaved = await payments_1.default.create(data);
            stronToken = await axios_1.default.post(`${stron_config.baseUrl}/VendingMeter`, {
                CompanyName: stron_config.CompanyName,
                UserName: stron_config.UserName,
                PassWord: stron_config.PassWord,
                MeterId: meter?.serial_number,
                is_vend_by_unit: "false",
                Amount: amount,
            });
            if (stronToken?.data?.length > 0) {
                let token = stronToken?.data[0];
                // save token
                let tokenData = {
                    token: token?.Token,
                    meter_id,
                    issue_date: new Date(),
                    amount: amount,
                    token_type: "Energy Meter",
                    total_units: token?.Total_unit,
                    id: (0, uuid_1.v4)(),
                    generated_manually: true,
                };
                await meter_tokens_1.default.create(tokenData);
                // send sms
                await axios_1.default.post(`${sms_config?.baseUrl}`, {
                    apikey: sms_config?.apikey,
                    partnerID: sms_config?.partnerID,
                    mobile: phone,
                    message: `Mtr: ${meter?.serial_number}\nToken: ${token?.Token}\nDate: ${(0, moment_1.default)(new Date()).format("YYYY/MM/D HH:mm")}\nUnits: ${token?.Total_unit}\nAmt: ${amount}`,
                    shortcode: "SI-MAXIS",
                });
            }
            return res.status(http_status_1.default.OK).json({
                statusCode: http_status_1.default.OK,
                paymentSaved,
                message: "Payment saved and token generated successfully",
            });
        }
        else {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Payment already exists",
            });
        }
    }
    catch (error) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
const getRevenueData = async (req, res) => {
    const filterType = req.query.filterType;
    const selectedDate = req.query.selectedDate;
    const dateObj = new Date(selectedDate);
    let data = [];
    let periodLabel = "";
    try {
        switch (filterType) {
            case "daily":
                const year = dateObj.getFullYear();
                const month = dateObj.getMonth() + 1; // getMonth() returns 0-based month
                data = await payments_1.default.getDailyRevenue(year, month);
                periodLabel = dateObj.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                });
                break;
            case "monthly":
                const selectedYear = dateObj.getFullYear();
                data = await payments_1.default.getMonthlyRevenue(selectedYear);
                periodLabel = selectedYear.toString();
                break;
            case "yearly":
                data = await payments_1.default.getYearlyRevenue(5);
                periodLabel = "Last 5 Years";
                break;
            default:
                throw new Error("Invalid filter type");
        }
        const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
        return res.status(http_status_1.default.OK).json({
            data,
            totalRevenue,
            periodLabel,
        });
    }
    catch (error) {
        console.error("Error fetching revenue data:", error);
        return res.status(http_status_1.default.BAD_REQUEST).json({
            statusCode: http_status_1.default.BAD_REQUEST,
            message: error.message,
        });
    }
};
module.exports = {
    getAllPayments,
    manualPayment,
    mpesaConfirmation,
    mpesaValidation,
    paymentCallback,
    timeoutUrl,
    getRevenueData,
};
