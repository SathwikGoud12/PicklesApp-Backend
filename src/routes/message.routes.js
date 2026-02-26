const express = require("express");
const router = express.Router();
const { getMessages } = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/:senderId/:receiverId", authMiddleware, getMessages);

module.exports = router;