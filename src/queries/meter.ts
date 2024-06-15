import { Meter, MeterTypes, User } from "../models";

const getAllMeters = async () => {
  const meters = await Meter.findAll({
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
    attributes: ["id", "serial_number"],
  });

  return meter;
};

export = {
  create,
  getAllMeters,
  getMeterById,
  getMeterBySerialNumber,
  update,
};
