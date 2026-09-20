const express = require("express");
const multer = require("multer");

const {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
} = require("../controllers/contactController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
       const uniqueName =
    Date.now() + "-" + Math.round(Math.random() * 1E9) + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

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