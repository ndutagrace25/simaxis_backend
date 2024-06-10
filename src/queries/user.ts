import { User } from "../models";

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

export = {
  getAllUsers,
  saveUser,
};
