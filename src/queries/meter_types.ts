import { MeterTypes } from "../models";

const getAllMeterTypes = async () => {
  const meters = await MeterTypes.findAll();
  return meters;
};

export = {
  getAllMeterTypes,
};
