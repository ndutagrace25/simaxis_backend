import httpStatus from "http-status";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import esperanzaPaymentsQueries from "../queries/esperanza_payments";

const displayName = (user: any): string | null => {
  if (!user) return null;
  const customer = user.Customer;
  const fullName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ");
  return fullName || user.username || null;
};

// flatten the creator/updater includes into created_by_name / updated_by_name
const serializePayment = (payment: any) => {
  const { creator, updater, ...data } = payment.toJSON();
  return {
    ...data,
    created_by_name: displayName(creator),
    updated_by_name: displayName(updater),
  };
};

const getAllEsperanzaPayments = async (req: Request, res: Response) => {
  const keyword: any = req?.query?.keyword ? req.query.keyword : "";
  const startDate: any = req?.query?.start_date ? req.query.start_date : "";
  const endDate: any = req?.query?.end_date ? req.query.end_date : "";
  const page = Math.max(1, Number(req?.query?.page) || 1);
  const limit = Math.max(1, Number(req?.query?.limit) || 10);
  const exportAll = req?.query?.export_all === "true";

  try {
    const { rows: payments, count: total } =
      await esperanzaPaymentsQueries.getAll({
        searchTerm: keyword,
        page,
        limit,
        exportAll,
        startDate,
        endDate,
      });

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      payments: payments.map(serializePayment),
      total,
      page: exportAll ? 1 : page,
      limit: exportAll ? total : limit,
    });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const csvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  // prevent spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const exportEsperanzaPayments = async (req: Request, res: Response) => {
  const keyword: any = req?.query?.keyword ? req.query.keyword : "";
  const startDate: any = req?.query?.start_date ? req.query.start_date : "";
  const endDate: any = req?.query?.end_date ? req.query.end_date : "";

  try {
    const { rows } = await esperanzaPaymentsQueries.getAll({
      searchTerm: keyword,
      exportAll: true,
      startDate,
      endDate,
    });

    const header = [
      "Payment Date",
      "Amount",
      "Payment Mode",
      "Reference",
      "Created At",
      "Created By",
      "Updated At",
      "Updated By",
    ];
    const lines = rows.map((payment: any) => {
      const row = serializePayment(payment);
      return [
        row.payment_date,
        row.amount,
        row.payment_mode,
        row.reference,
        row.created_at,
        row.created_by_name,
        row.updated_at,
        row.updated_by_name,
      ]
        .map(csvCell)
        .join(",");
    });

    const filename = `esperanza-payments-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(httpStatus.OK).send("\uFEFF" + [header.join(","), ...lines].join("\r\n"));
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const getEsperanzaPayment = async (req: Request, res: Response) => {
  try {
    const payment = await esperanzaPaymentsQueries.getById(req.params.id);

    if (!payment) {
      return res.status(httpStatus.NOT_FOUND).json({
        statusCode: httpStatus.NOT_FOUND,
        message: "Payment not found",
      });
    }

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      payment: serializePayment(payment),
    });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const createEsperanzaPayment = async (req: any, res: Response) => {
  const errors: any = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: errors.errors[0]?.msg,
    });
  }

  const { payment_date, amount, payment_mode, reference } = req.body;
  const userId = req.currentUser?.id;

  try {
    const payment = await esperanzaPaymentsQueries.create({
      payment_date,
      amount,
      payment_mode,
      reference: reference || undefined,
      created_by: userId,
      updated_by: userId,
    });

    return res.status(httpStatus.CREATED).json({
      statusCode: httpStatus.CREATED,
      payment,
      message: "Payment saved successfully",
    });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const updateEsperanzaPayment = async (req: any, res: Response) => {
  const errors: any = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: errors.errors[0]?.msg,
    });
  }

  const { payment_date, amount, payment_mode, reference } = req.body;

  try {
    const payment = await esperanzaPaymentsQueries.update(req.params.id, {
      payment_date,
      amount,
      payment_mode,
      reference,
      updated_by: req.currentUser?.id,
    });

    if (!payment) {
      return res.status(httpStatus.NOT_FOUND).json({
        statusCode: httpStatus.NOT_FOUND,
        message: "Payment not found",
      });
    }

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      payment,
      message: "Payment updated successfully",
    });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const deleteEsperanzaPayment = async (req: Request, res: Response) => {
  try {
    const deleted = await esperanzaPaymentsQueries.remove(req.params.id);

    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).json({
        statusCode: httpStatus.NOT_FOUND,
        message: "Payment not found",
      });
    }

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Payment deleted successfully",
    });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

export = {
  getAllEsperanzaPayments,
  exportEsperanzaPayments,
  getEsperanzaPayment,
  createEsperanzaPayment,
  updateEsperanzaPayment,
  deleteEsperanzaPayment,
};
