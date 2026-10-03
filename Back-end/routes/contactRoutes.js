const express = require("express");
const multer = require("multer");
// fs and path are no longer needed here since we're not saving to local disk

const {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
} = require("../controllers/contactController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Multer memory storage — keeps the file in RAM as a buffer
// instead of writing it to local disk
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// Create Contact
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createContact
);

// Get All Contacts
router.get(
    "/",
    authMiddleware,
    getContacts
);

// Get Contact By ID
router.get(
    "/:id",
    authMiddleware,
    getContactById
);

// Update Contact
router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    updateContact
);

// Delete Contact
router.delete(
    "/:id",
    authMiddleware,
    deleteContact
);

module.exports = router;