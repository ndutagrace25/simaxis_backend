import { Customer, User } from "../models";

const getAllCustomers = async () => {
  const customers = await Customer.findAll({
    include: { model: User, attributes: ["phone", "email"] },
    order: [["created_at", "DESC"]],
  });
  return customers;
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
      "customer_number"
    ],
    include: {
      model: User,
      attributes: ["phone", "email"],
    },
  });

  return customer;
};

export = {
  getAllCustomers,
  getCustomerById,
  create,
  update,
};
