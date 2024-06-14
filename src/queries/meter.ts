import { Meter, MeterTypes, User } from "../models";

const getAllMeters = async () => {
  const meters = await Meter.findAll({
    include: { model: MeterTypes, attributes: ["name"] },
    order: [["created_at", "DESC"]],
  });
  return meters;
};

const create = async (meterDetails: {
  id: string;
  meter_type_id: string;
  serial_number: number;
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
  const customer = await Meter.findOne({
    where: { id },
    attributes: [
      "id",
      "first_name",
      "middle_name",
      "last_name",
      "national_id",
      "location",
    ],
    include: {
      model: User,
      attributes: ["phone", "email"],
    },
  });

  return customer;
};

export = {
  getAllMeters,
  getMeterById,
  create,
  update,
};
