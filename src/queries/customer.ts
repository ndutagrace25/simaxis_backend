import { Customer, User } from "../models";

const getAllCustomers = async () => {
  const customers = await Customer.findAll({
    include: { model: User, attributes: ["phone", "email"] },
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

const update = async (id: string, newData: { is_verified: boolean }) => {
  const updatedCustomer = await Customer.update(newData, {
    where: { id },
    returning: true,
  });

  return updatedCustomer;
};

export = {
  getAllCustomers,
  create,
  update,
};
