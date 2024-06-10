import bcrypt from "bcrypt";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import usersQueries from "../queries/user";
import { v4 as uuidv4 } from "uuid";
import { validationResult, ValidationError } from "express-validator";

const loginUser = async (req: Request, res: Response) => {};

const registerUser = async (req: Request, res: Response) => {
  const validationErrors: ValidationError[] = validationResult(req).array();

  if (validationErrors.length > 0) {
    const [error]: any = validationErrors;
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ statusCode: httpStatus.BAD_REQUEST, message: error.msg });
  }

  const {
    first_name,
    middle_name,
    last_name,
    national_id,
    location,
    plot_number,
    email,
    password,
    phone,
  } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassowd = await bcrypt.hash(password, salt);
  let user_data = {
    email,
    phone,
    password: hashedPassowd,
  };

  let customer_data = {
    first_name,
    middle_name,
    last_name,
    national_id,
    location,
    plot_number,
  };

  try {
    
  } catch (error) {
    
  }
  return res
    .status(httpStatus.OK)
    .json({ statusCode: httpStatus.OK, user_data, customer_data });
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await usersQueries.getAllUsers();
    return res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
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

// create a new user account
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
      message: "User saved successfully",
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

export = { loginUser, getUsers, registerUser, saveUser };
