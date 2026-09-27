import httpStatus from "http-status";
import { Customer, User } from "../models";

// Roles treated as directors
const DIRECTOR_ROLES = ["Super Admin"];

// The JWT only carries the customer id, so resolve the user (id + role) from it.
// Must run after verifyToken.
export const attachCurrentUser = async (req: any, res: any, next: any) => {
  try {
    const customer: any = req.user?.id
      ? await Customer.findByPk(req.user.id, { attributes: ["user_id"] })
      : null;
    const user: any = customer?.user_id
      ? await User.findByPk(customer.user_id, { attributes: ["id", "role"] })
      : null;

    req.currentUser = user ? { id: user.id, role: user.role } : null;
    next();
  } catch (error: any) {
    return res.status(httpStatus.BAD_REQUEST).json({
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};

// Must run after verifyToken and attachCurrentUser.
export const requireDirector = (req: any, res: any, next: any) => {
  if (!req.currentUser || !DIRECTOR_ROLES.includes(req.currentUser.role)) {
    return res.status(httpStatus.FORBIDDEN).json({
      statusCode: httpStatus.FORBIDDEN,
      message: "Only directors can perform this action",
    });
  }
  next();
};
