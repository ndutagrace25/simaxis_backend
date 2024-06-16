import { Customer, CustomerMeter, Meter, Tenant } from "../models";

const getAllCustomerMeters = async () => {
  const customer_meters = await CustomerMeter.findAll({
    include: [
      {
        model: Customer,
        attributes: ["first_name", "middle_name", "last_name"],
      },
      {
        model: Tenant,
        attributes: ["first_name", "last_name"],
      },
      {
        model: Meter,
        attributes: ["serial_number", "county_number"],
      },
    ],
  });
  return customer_meters;
};

const getCustomerMeterByMeterId = async (meter_id: string) => {
  const meter = await CustomerMeter.findOne({ where: { meter_id } });
  return meter;
};

const create = async (customerMeterDetails: {
  meter_id: string;
  customer_id: string;
  id: string;
}) => {
  const customer_meter = await CustomerMeter.create(customerMeterDetails);

  return customer_meter;
};

export = {
  create,
  getAllCustomerMeters,
  getCustomerMeterByMeterId,
};
