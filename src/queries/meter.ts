import { CustomerMeter, Meter, MeterTypes, User } from "../models";
import { Op } from "sequelize";

const getAllMeters = async (searchTerm = "") => {
  // @ts-ignore
  const is_number = !isNaN(parseFloat(searchTerm)) && isFinite(searchTerm);
  console.log(is_number, "is_number");
  const searchCondition = {
    [Op.or]: [
      {
        serial_number: is_number ? BigInt(searchTerm) : 0,
      },
    ],
  };
  const meters = await Meter.findAll({
    where: searchTerm ? searchCondition : {},
    include: { model: MeterTypes, attributes: ["name", "type"] },
    order: [["created_at", "DESC"]],
  });
  return meters;
};

const create = async (meterDetails: {
  id: string;
  meter_type_id: string;
  serial_number: number;
  county_number: number;
}) => {
  const meter = await Meter.create(meterDetails);

  return meter;
};

const update = async (
  id: string,
  newData: {
    is_synced_to_stron?: boolean;
    tamper_value?: string;
    credit_value?: string;
  }
) => {
  const updatedMeter = await Meter.update(newData, {
    where: { id },
    returning: true,
  });

  return updatedMeter;
};

const getMeterById = async (id: string) => {
  const meter = await Meter.findOne({
    where: { id },
    attributes: ["id", "serial_number"],
    include: { model: MeterTypes, attributes: ["name", "type"] },
  });

  return meter;
};

const getMeterBySerialNumber = async (serial_number: number) => {
  const meter = await Meter.findOne({
    where: { serial_number },
    attributes: ["id", "serial_number", "is_synced_to_stron"],
  });

  return meter;
};

const getSyncedMeters = async () => {
  const synced_meters = await Meter.findAll({
    where: { is_synced_to_stron: true },
    attributes: ["id", "serial_number"],
    include: [{ model: CustomerMeter, attributes: ["id", "meter_id"] }],
  });
  return synced_meters;
};

export = {
  create,
  getAllMeters,
  getMeterById,
  getMeterBySerialNumber,
  getSyncedMeters,
  update,
};
