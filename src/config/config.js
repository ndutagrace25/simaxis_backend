const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    timezone: "Africa/Nairobi",
    // dialectOptions: {
    //   ssl: {
    //     require: true, //false on localhost
    //     rejectUnauthorized: false, // Heroku requires this for self-signed certificates
    //   },
    // },
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    timezone: "Africa/Nairobi",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Heroku requires this for self-signed certificate
      },
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    timezone: "Africa/Nairobi",
  },
  stron: {
    CompanyName: process.env.STRON_COMPANY_NAME,
    UserName: process.env.STRON_USERNAME,
    PassWord: process.env.STRON_PASSWORD,
    baseUrl: process.env.STRON_BASE_URL,
  },
  sms: {
    apikey: process.env.SMS_API_KEY,
    partnerID: process.env.SMS_PARTNER_ID,
    shortcode: process.env.SMS_SHORT_CODE,
    baseUrl: process.env.SMS_URL,
    baseUrlOtp: process.env.SMS_URL_OTP,
    mainBaseUrl: process.env.SMS_BASE_URL,
  },
};
