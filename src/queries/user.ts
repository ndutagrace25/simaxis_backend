import { Customer, Tenant, User } from "../models";

const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: [
      "id",
      "username",
      "email",
      "phone",
      "role",
      "created_at",
      "updated_at",
    ],
  });
  return users;
};

const saveUser = async (userDetails: {
  id: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: string;
}) => {
  const user = await User.create(userDetails);

  return user;
};

const getUserByPhone = async (phone: string) => {
  const user = await User.findOne({
    where: { phone },
    attributes: ["id", "phone", "password", "role"],
    include: [
      {
        model: Customer,
        attributes: ["id", "is_verified", "first_name", "last_name"],
      },
      {
        model: Tenant,
        attributes: ["id", "first_name", "last_name"],
      },
    ],
  });

  return user;
};

export = {
  getAllUsers,
  getUserByPhone,
  saveUser,
};
