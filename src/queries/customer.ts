import { Customer, Tenant, User } from "../models";
import { Op } from "sequelize";

const getAllCustomers = async (searchTerm = "") => {
  const searchCondition = {
    [Op.or]: [
      { first_name: { [Op.iLike]: `%${searchTerm}%` } },
      { last_name: { [Op.iLike]: `%${searchTerm}%` } },
      { middle_name: { [Op.iLike]: `%${searchTerm}%` } },
      {
        "$User.email$": { [Op.iLike]: `%${searchTerm}%` },
      },
      {
        "$User.phone$": { [Op.iLike]: `%${searchTerm}%` },
      },
    ],
  };
  const customers = await Customer.findAll({
    where: searchTerm ? searchCondition : {},
    include: {
      model: User,
      attributes: ["phone", "email"],
    },
    order: [["created_at", "DESC"]],
  });

  return customers;
};

const getAllLandlords = async () => {
  const landlords = await Customer.findAll({
    where: { is_verified: true, is_synced_to_stron: true },
    attributes: ["id", "first_name", "last_name", "building_name", "location"],
  });
  return landlords;
};

const create = async (customerDetails: {
  id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  national_id: number;
  location?: string;
  lat?: number;
  long?: number;
  plot_number?: string;
}) => {
  const customer = await Customer.create(customerDetails);

  return customer;
};

const update = async (
  id: string,
  newData: {
    is_verified?: boolean;
    is_synced_to_stron?: boolean;
    is_active?: boolean;
  }
) => {
  const updatedCustomer = await Customer.update(newData, {
    where: { id },
    returning: true,
  });

  return updatedCustomer;
};

const getCustomerById = async (id: string) => {
  const customer = await Customer.findOne({
    where: { id },
    attributes: [
      "id",
      "first_name",
      "middle_name",
      "last_name",
      "national_id",
      "location",
      "customer_number",
    ],
    include: {
      model: User,
      attributes: ["phone", "email"],
    },
  });

  return customer;
};

const getLandlordTenants = async (landlord_id: string) => {
  const landlord_tenants = await Tenant.findAll({
    where: { landlord_id },
    attributes: ["id", "first_name", "last_name"],
  });
  return landlord_tenants;
};

export = {
  getAllCustomers,
  getAllLandlords,
  getCustomerById,
  getLandlordTenants,
  create,
  update,
};
