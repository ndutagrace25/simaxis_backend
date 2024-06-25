import { Op, Sequelize } from "sequelize";
import {
  Customer,
  CustomerMeter,
  Meter,
  MeterToken,
  sequelize,
  Tenant,
} from "../models";

const getAllCustomerMeters = async () => {
  const customer_meters = await CustomerMeter.findAll({
    include: [
      {
        model: Customer,
        attributes: [
          "first_name",
          "middle_name",
          "last_name",
          "customer_number",
        ],
      },
      {
        model: Tenant,
        attributes: ["first_name", "last_name"],
      },
      {
        model: Meter,
        attributes: ["serial_number", "county_number", "is_synced_to_stron"],
      },
    ],
  });
  return customer_meters;
};

const getCustomerMeterByMeterId = async (meter_id: string) => {
  const meter = await CustomerMeter.findOne({ where: { meter_id } });
  return meter;
};
const getCustomerMeterById = async (id: string) => {
  const meter = await CustomerMeter.findOne({ where: { id } });
  return meter;
};
const getCustomerMeterByLandlordId = async (
  customer_id: string,
  serial_number?: string | undefined
) => {
  const meterWhere = serial_number ? { serial_number } : {};
  const landlord_meters = await CustomerMeter.findAll({
    where: { customer_id },
    include: [
      {
        model: Tenant,
        attributes: ["first_name", "last_name"],
      },
      {
        model: Meter,
        where: meterWhere,
        attributes: ["serial_number", "county_number", "is_synced_to_stron"],
        include: [
          {
            model: MeterToken,
            attributes: ["token", "created_at", "amount"],
            order: [["created_at", "ASC"]],
          },
        ],
      },
    ],
  });
  return landlord_meters;
};

const getCustomerMeterByTenantId = async (tenant_id: string) => {
  const tenant_meters = await CustomerMeter.findOne({
    where: { tenant_id },
    include: [
      {
        model: Tenant,
        attributes: ["first_name", "last_name"],
      },
      {
        model: Meter,
        attributes: ["serial_number", "county_number", "is_synced_to_stron"],
        include: [
          {
            model: MeterToken,
            attributes: ["token", "created_at", "amount"],
            order: [["created_at", "DESC"]],
          },
        ],
      },
    ],
  });
  return tenant_meters;
};

const create = async (customerMeterDetails: {
  meter_id: string;
  customer_id: string;
  id: string;
}) => {
  const customer_meter = await CustomerMeter.create(customerMeterDetails);

  return customer_meter;
};

const update = async (
  id: string,
  newData: {
    is_synced_to_stron?: boolean;
    tenant_id?: string;
  }
) => {
  const updatedCustomerMeter = await CustomerMeter.update(newData, {
    where: { id },
    returning: true,
  });

  return updatedCustomerMeter;
};

export = {
  create,
  getAllCustomerMeters,
  getCustomerMeterByMeterId,
  getCustomerMeterById,
  getCustomerMeterByLandlordId,
  getCustomerMeterByTenantId,
  update,
};
