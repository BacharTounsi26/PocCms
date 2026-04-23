const axios = require("axios");
const NodeCache = require("node-cache");
const config = require("../config");

// Token cache: TTL ~8h (cookie expiry from SAP is ~8h)
const tokenCache = new NodeCache({ stdTTL: 28000 });
const TOKEN_KEY = "sap_cookies";

/**
 * SAP returns token as Set-Cookie headers (not JSON body).
 * Key cookie: rbx-apiAccessToken=JWT+xxx
 * We need to forward ALL cookies on subsequent requests.
 */
async function getToken() {
  const cached = tokenCache.get(TOKEN_KEY);
  if (cached) return cached;

  const url = `${config.sap.baseUrl}${config.sap.tokenEndpoint}`;

  const response = await axios.post(
    url,
    {
      userLogin: config.sap.userLogin,
      password: config.sap.password,
      clientId: config.sap.clientId,
      clientSecret: config.sap.clientSecret,
    },
    { maxRedirects: 0, validateStatus: (s) => s < 400 }
  );

  // Extract cookies from Set-Cookie headers
  const setCookies = response.headers["set-cookie"];
  if (!setCookies || setCookies.length === 0) {
    throw new Error("No cookies returned from SAP token endpoint");
  }

  // Build a cookie string for subsequent requests: "name=value; name2=value2"
  const cookieString = setCookies
    .map((c) => c.split(";")[0]) // keep only "name=value" part
    .join("; ");

  tokenCache.set(TOKEN_KEY, cookieString);
  return cookieString;
}

async function searchProducts(query, cookieString) {
  const url = `${config.sap.baseUrl}${config.sap.productsEndpoint}`;

  const response = await axios.get(url, {
    params: { productIds: query },
    headers: {
      Cookie: cookieString,
    },
  });

  return response.data;
}

module.exports = { getToken, searchProducts };
