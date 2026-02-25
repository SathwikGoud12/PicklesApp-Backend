const express = require("express");
const verifyAccessToken = require("../middlewares/Auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

const router = express.Router();

// 🟢 User Routes
router.post("/", verifyAccessToken, createOrder);
router.get("/", verifyAccessToken, getMyOrders);

// 🔴 Admin Routes
router.get("/admin", verifyAccessToken, authorizeRoles("admin"), getAllOrders);
router.put("/:id", verifyAccessToken, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;