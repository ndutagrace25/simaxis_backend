"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const npmlog_1 = __importDefault(require("npmlog"));
const models_1 = require("./models");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
//routes
const routes_1 = require("./routes");
app.use("/user", routes_1.user);
app.use("/customer", routes_1.customer);
models_1.sequelize
    .sync()
    .then(() => {
    app.listen(PORT, () => {
        npmlog_1.default.info("Server running on port " + PORT, "");
    });
})
    .catch((err) => {
    console.error("Unable to connect to the database:", err);
});
// Ensble CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT,PATCH");
    next();
});
