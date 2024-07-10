import {
  Customer,
  CustomerMeter,
  Meter,
  MeterToken,
  Tenant,
} from "../models";

const getAllCustomerMeters = async (query?: {
  meter_id?: string;
  customer_id?: string;
  county_number?: string;
}) => {
  const customer_meters = await CustomerMeter.findAll({
    where: query?.meter_id
      ? {
          meter_id: query?.meter_id,
        }
      : query?.customer_id
      ? { customer_id: query?.customer_id }
      : { customer_id: "2b813658-0689-432f-bbfa-a94740e4da04" },
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
        where: query?.county_number
          ? { county_number: query?.county_number }
          : {},
        attributes: ["serial_number", "county_number", "is_synced_to_stron"],
      },
    ],
  });
  return customer_meters;
};

const getCustomerMeterByMeterId = async (meter_id: string) => {
  // console.log(meter_id, "meter id");
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
