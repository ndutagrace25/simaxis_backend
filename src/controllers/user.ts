import bcrypt from "bcrypt";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import usersQueries from "../queries/user";
import customerQueries from "../queries/customer";
import { v4 as uuidv4 } from "uuid";
import { validationResult, ValidationError } from "express-validator";
import { cleanPhone } from "../utils";
import dotenv from "dotenv";

dotenv.config();

interface UserWithCustomer {
  id: string;
  phone: string;
  password: string;
  Customer?: {
    is_verified: boolean;
    first_name: string;
    last_name: string;
    dataValues: any;
  };
}

const loginUser = async (req: Request, res: Response) => {
  const validationErrors: ValidationError[] = validationResult(req).array();
  if (validationErrors.length > 0) {
    const [error]: any = validationErrors;
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ statusCode: httpStatus.BAD_REQUEST, message: error.msg });
  }

  const { phone, password } = req.body;

  try {
    const userExists: UserWithCustomer | null =
      await usersQueries.getUserByPhone(cleanPhone(phone));

    if (!userExists?.phone) {
      return res.status(httpStatus.BAD_REQUEST).json({
        statusCode: httpStatus.BAD_REQUEST,
        message: "User doesn't exist, kindly register to proceed",
      });
    }

    if (userExists?.Customer) {
      const { is_verified } = userExists?.Customer.dataValues;
      if (!is_verified) {
        return res.status(httpStatus.BAD_REQUEST).json({
          statusCode: httpStatus.BAD_REQUEST,
          message:
            "Your account is not yet verified, once verified you will be notified",
        });
      }
    }

    // check the provided password if it matches user's password
    await bcrypt.compare(password, userExists?.password, (err, isValid) => {
      if (isValid) {
        const jwt_secret: any = process.env.JWT_SECRET;

        const data = userExists?.Customer?.dataValues;

        // create access token on login
        let token = jwt.sign(data, jwt_secret, {
          expiresIn: "2h",
        });

        return res.status(httpStatus.OK).json({
          statusCode: httpStatus.OK,
          message: "Login success!",
          token,
          user: {
            id: userExists.id,
            first_name: userExists?.Customer?.first_name,
            last_name: userExists?.Customer?.last_name,
          },
        });
      } else {
        return res.status(httpStatus.BAD_REQUEST).json({
          statusCode: httpStatus.BAD_REQUEST,
          message: "Invalid password!",
        });
      }
    });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      error: error.errors,
    });
  }
};

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
    username,
  } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassowd = await bcrypt.hash(password, salt);

  const user_id = uuidv4();

  let user_data = {
    id: user_id,
    email,
    phone: cleanPhone(phone),
    password: hashedPassowd,
    role: "Tenant",
    username,
  };

  let customer_data = {
    id: uuidv4(),
    user_id,
    first_name,
    middle_name,
    last_name,
    national_id,
    location,
    plot_number,
  };

  try {
    const user = await usersQueries.saveUser(user_data);

    const customer = await customerQueries.create(customer_data);
    return res
      .status(httpStatus.OK)
      .json({ statusCode: httpStatus.OK, user, customer });
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      errors: error.errors,
    });
  }
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
