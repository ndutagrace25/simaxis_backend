import httpStatus from "http-status";
import { Request, Response } from "express";
import usersQueries from "../queries/user";
import { v4 as uuidv4 } from "uuid";

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await usersQueries.getAllUsers();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Test!",
      users,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

const saveUser = async (req: Request, res: Response) => {
  const { username, phone, email, role, password } = req.body;

  let data = {
    id: uuidv4(),
    username,
    phone,
    email,
    role,
    password,
  };

  try {
    const user = await usersQueries.saveUser(data);

    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: "Test!",
      user,
    });
  } catch (error: any) {
    console.error("Error saving", error);
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.errors,
    });
  }
};

export = { getUsers, saveUser };
