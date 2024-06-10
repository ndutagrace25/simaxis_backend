import express, { Application, NextFunction, Request, Response } from "express";
import logging from "npmlog";
import { sequelize } from "./models";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
import { customer, user } from "./routes";

app.use("/user", user);
app.use("/customer", customer);

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      logging.info("Server running on port " + PORT, "");
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Ensble CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, OPTIONS, DELETE, PUT,PATCH"
  );
  next();
});
