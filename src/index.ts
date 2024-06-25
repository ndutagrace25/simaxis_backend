import express, { Application, NextFunction, Request, Response } from "express";
import logging from "npmlog";
import { sequelize } from "./models";
import dotenv from "dotenv";
// @ts-ignore
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT = process.env.SI_PORT || 5002;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

// Set up CORS with specific origin
app.use(cors());

// Your existing routes and middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, OPTIONS, DELETE, PUT, PATCH"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
import {
  callback,
  counties,
  customer,
  customer_meters,
  landlord,
  meter,
  meter_types,
  payments,
  tenant,
  user,
} from "./routes";

app.use("/callback", callback);
app.use("/counties", counties);
app.use("/customer", customer);
app.use("/customer-meter", customer_meters);
app.use("/landlord", landlord);
app.use("/meter", meter);
app.use("/meter_types", meter_types);
app.use("/payments", payments);
app.use("/tenant", tenant);
app.use("/user", user);

sequelize
  .sync()
  .then(() => {
    logging.info("DB connected successfully", "");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.listen(PORT, () => {
  logging.info("Server running on port " + PORT, "");
});
