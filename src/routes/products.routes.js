const express = require("express");
const verifyAccessToken = require("../middlewares/Auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/products.controller");
const router = express.Router();

router.post("/", verifyAccessToken, authorizeRoles("admin"), createProduct);

router.delete("/:id", verifyAccessToken, authorizeRoles("admin"), deleteProduct);


router.get("/",getAllProducts);
router.get("/:id",getProductById);


module.exports=router