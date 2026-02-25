const express = require("express");
const verifyAccessToken = require("../middlewares/Auth.middleware");

const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

const router = express.Router();

router.post("/", verifyAccessToken, addToCart);
router.get("/", verifyAccessToken, getCart);
router.put("/", verifyAccessToken, updateQuantity);
router.delete("/:productId", verifyAccessToken, removeFromCart);
router.delete("/", verifyAccessToken, clearCart);

module.exports = router;