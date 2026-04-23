require("dotenv").config();

const config = {
  port: process.env.PORT || 3001,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  sap: {
    baseUrl: process.env.SAP_BASE_URL,
    tokenEndpoint: process.env.SAP_TOKEN_ENDPOINT,
    productsEndpoint: process.env.SAP_PRODUCTS_ENDPOINT,
    userLogin: process.env.SAP_USER_LOGIN,
    password: process.env.SAP_PASSWORD,
    clientId: process.env.SAP_CLIENT_ID,
    clientSecret: process.env.SAP_CLIENT_SECRET,
  },
};

module.exports = config;
