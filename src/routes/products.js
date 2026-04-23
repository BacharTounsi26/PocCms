const express = require("express");
const NodeCache = require("node-cache");
const { getToken, searchProducts } = require("../services/sapService");

const router = express.Router();

// Products cache: TTL 5 min
const productsCache = new NodeCache({ stdTTL: 300 });

// ── MOCK DATA for testing the full E2E flow without real SAP product codes ──
const MOCK_PRODUCTS = [
  { code: "PR_0028-0004030"},
  { code: "PR_0079-5216313"},
  { code: "PR_0079-5261503" },

];

// ── Mock endpoint: GET /api/products/mock?query=xxx ──
router.get("/products/mock", (req, res) => {
  const { query } = req.query;
  if (!query || query.trim().length === 0) {
    return res.json(MOCK_PRODUCTS);
  }
  const q = query.toLowerCase();
  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.code || "").toLowerCase().includes(q)
  );
  return res.json(filtered);
});

// ── Real SAP endpoint: GET /api/products?query=CODE1,CODE2 ──
router.get("/products", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Check cache
    const cacheKey = `products_${query}`;
    const cached = productsCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Get SAP token (cookies)
    const cookies = await getToken();

    // Search products by IDs
    const rawProducts = await searchProducts(query, cookies);

    // Normalize response to simplified format
    const products = normalizeProducts(rawProducts);

    // Cache results
    productsCache.set(cacheKey, products);

    return res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: "SAP API error",
        details: error.response.data,
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

function normalizeProducts(data) {
  // SAP Rubix response format: { items: [...], notFoundItems: [...], pageNumber, itemsTotalCount }
  const items = Array.isArray(data)
    ? data
    : data.items || data.products || data.results || data.value || [];

  return items.map((p) => ({
    code: p.code || p.productCode || p.id || "",
    name: p.erpSkuName || p.name || p.title || p.description || "",
  }));
}

module.exports = router;
