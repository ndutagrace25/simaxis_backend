"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const npmlog_1 = __importDefault(require("npmlog"));
const models_1 = require("./models");
const dotenv_1 = __importDefault(require("dotenv"));
// @ts-ignore
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.SI_PORT || 5002;
const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};
// Set up CORS with specific origin
app.use((0, cors_1.default)());
// Your existing routes and middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
//routes
const routes_1 = require("./routes");
app.use("/callback", routes_1.callback);
app.use("/counties", routes_1.counties);
app.use("/customer", routes_1.customer);
app.use("/customer-meter", routes_1.customer_meters);
app.use("/landlord", routes_1.landlord);
app.use("/meter", routes_1.meter);
app.use("/meter_types", routes_1.meter_types);
app.use("/payments", routes_1.payments);
app.use("/tenant", routes_1.tenant);
app.use("/tokens", routes_1.meter_tokens);
app.use("/user", routes_1.user);
models_1.sequelize
    .sync()
    .then(() => {
    npmlog_1.default.info("DB connected successfully", "");
})
    .catch((err) => {
    console.error("Unable to connect to the database:", err);
});
app.listen(PORT, () => {
    npmlog_1.default.info("Server running on port " + PORT, "");
});
