const express = require("express");

const { getAllUsers, getUserContacts } = require("../controllers/AdminController");
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.get("/users", authMiddleware, isAdmin, getAllUsers);
router.get("/users/:id/contacts", authMiddleware, isAdmin, getUserContacts);

module.exports = router;