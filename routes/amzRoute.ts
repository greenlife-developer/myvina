const express = require("express");
const router = express.Router();
const {
  getOrders,
  auth,
  getInventory,
  getCustomerReturnsReport,
  getPaymentDetails,
  getAccount,
  getInventoryValue
} = require("../controllers/amzController");

router.post("/auth", auth);
router.get("/get-orders", getOrders);
router.get("/get-inventory", getInventory);
router.get("/get-customer-returns-report", getCustomerReturnsReport);
router.get("/get-payment-details", getPaymentDetails);
router.get("/get-account", getAccount);
router.get("/inventory-value", getInventoryValue)

module.exports = router;
