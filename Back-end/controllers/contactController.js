const pool = require("../config/db");
const crypto = require("crypto");
const path = require("path");
const { uploadImageToBlob, deleteImageFromBlob } = require("../config/blobStorage");


// =====================================================
// CREATE CONTACT
// =====================================================

const createContact = async (req, res) => {

    try {

        console.log("===== CREATE CONTACT CALLED =====");
        console.log("BODY:", req.body);
        console.log("FILE:", req.file ? req.file.originalname : "none");

        const { name, phone, email, address } = req.body;

        // ================================
        // VALIDATION
        // ================================

        if (!name || !phone) {
            return res.status(400).json({
                message: "Name and phone are required"
            });
        }

        // ================================
        // LOGGED-IN USER ID
        // ================================

        const userId = req.user.userId;

        // ================================
        // HASH + DUPLICATE CHECK (from buffer, no disk needed)
        // ================================

        let imageHash = null;

        if (req.file) {

            imageHash = crypto
                .createHash("sha256")
                .update(req.file.buffer)
                .digest("hex");

            const [duplicateImage] = await pool.query(
                "SELECT id FROM contacts WHERE image_hash = ?",
                [imageHash]
            );

            if (duplicateImage.length > 0) {
                return res.status(409).json({
                    message: "This photo is already used for another contact."
                });
            }
        }

        // ================================
        // INSERT CONTACT (image_path set after we know contactId)
        // ================================

        const [result] = await pool.query(
            `INSERT INTO contacts
            (user_id, name, phone, email, address, image_path, image_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                name,
                phone,
                email,
                address,
                null,
                imageHash
            ]
        );

        const contactId = result.insertId;

        console.log("USER ID:", userId);
        console.log("CONTACT ID:", contactId);

        // ================================
        // UPLOAD IMAGE TO BLOB STORAGE
        // ================================

        let imagePath = null;

        if (req.file) {

            const extension = path.extname(req.file.originalname);

            const finalFileName =
                `${userId}-${contactId}-${path.basename(
                    req.file.originalname,
                    extension
                )}${extension}`;

            imagePath = await uploadImageToBlob(
                req.file.buffer,
                finalFileName,
                req.file.mimetype
            );

            await pool.query(
                `UPDATE contacts
                 SET image_path = ?
                 WHERE id = ? AND user_id = ?`,
                [
                    imagePath,
                    contactId,
                    userId
                ]
            );

            console.log("FINAL IMAGE URL:", imagePath);
        }

        // ================================
        // RESPONSE
        // ================================

        res.status(201).json({
            message: "Contact created successfully",
            contactId: contactId,
            imagePath: imagePath
        });

    } catch (error) {

        console.error("Create Contact Error:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            let field = 'value';
            if (error.sqlMessage.includes('email')) field = 'email';
            else if (error.sqlMessage.includes('image_path')) field = 'image';

            return res.status(409).json({
                message: `This ${field} is already in use.`
            });
        }

        res.status(500).json({ message: "Server error" });
    }
};


// =====================================================
// GET ALL CONTACTS
// =====================================================

const getContacts = async (req, res) => {
    try {

        const userId = req.user.userId;

        const [contacts] = await pool.query(
            `SELECT
                id,
                user_id,
                name,
                phone,
                email,
                address,
                image_path
             FROM contacts
             WHERE user_id = ?
             ORDER BY id DESC`,
            [userId]
        );

        res.status(200).json({
            contacts: contacts
        });

    } catch (error) {

        console.error("Get Contacts Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET CONTACT BY ID
// =====================================================

const getContactById = async (req, res) => {
    try {

        const contactId = req.params.id;
        const userId = req.user.userId;

        const [contacts] = await pool.query(
            `SELECT
                id,
                user_id,
                name,
                phone,
                email,
                address,
                image_path
             FROM contacts
             WHERE id = ?
             AND user_id = ?`,
            [
                contactId,
                userId
            ]
        );

        if (contacts.length === 0) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        res.status(200).json({
            contact: contacts[0]
        });

    } catch (error) {

        console.error("Get Contact By ID Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// UPDATE CONTACT
// =====================================================

const updateContact = async (req, res) => {

    try {

        const { name, phone, email, address } = req.body;

        const contactId = req.params.id;

        const userId = req.user.userId;

        // Find existing contact
        const [existingContact] = await pool.query(
            `SELECT *
             FROM contacts
             WHERE id = ?
             AND user_id = ?`,
            [
                contactId,
                userId
            ]
        );

        if (existingContact.length === 0) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        // ============================================
        // UPDATE WITHOUT NEW IMAGE
        // ============================================

        if (!req.file) {

            await pool.query(
                `UPDATE contacts
                 SET
                    name = ?,
                    phone = ?,
                    email = ?,
                    address = ?
                 WHERE id = ?
                 AND user_id = ?`,
                [
                    name,
                    phone,
                    email,
                    address,
                    contactId,
                    userId
                ]
            );

            return res.status(200).json({
                message: "Contact updated successfully"
            });
        }

        // ============================================
        // NEW IMAGE SELECTED + DUPLICATE CHECK
        // ============================================

        const imageHash = crypto
            .createHash("sha256")
            .update(req.file.buffer)
            .digest("hex");

        const [duplicateImage] = await pool.query(
            "SELECT id FROM contacts WHERE image_hash = ? AND id != ?",
            [imageHash, contactId]
        );

        if (duplicateImage.length > 0) {
            return res.status(409).json({
                message: "This photo is already used for another contact."
            });
        }

        const oldImagePath = existingContact[0].image_path;

        const extension = path.extname(req.file.originalname);

        const originalNameWithoutExtension = path.basename(
            req.file.originalname,
            extension
        );

        const finalFileName =
            `${userId}-${contactId}-${originalNameWithoutExtension}${extension}`;

        // ============================================
        // UPLOAD NEW IMAGE TO BLOB
        // ============================================

        const newImagePath = await uploadImageToBlob(
            req.file.buffer,
            finalFileName,
            req.file.mimetype
        );

        // ============================================
        // UPDATE CONTACT + IMAGE
        // ============================================

        await pool.query(
            `UPDATE contacts
             SET
                name = ?,
                phone = ?,
                email = ?,
                address = ?,
                image_path = ?,
                image_hash = ?
             WHERE id = ?
             AND user_id = ?`,
            [
                name,
                phone,
                email,
                address,
                newImagePath,
                imageHash,
                contactId,
                userId
            ]
        );

        // ============================================
        // DELETE OLD IMAGE FROM BLOB
        // ============================================

        if (oldImagePath) {
            await deleteImageFromBlob(oldImagePath);
        }

        res.status(200).json({
            message: "Contact updated successfully",
            imagePath: newImagePath
        });

    } catch (error) {

        console.error("Update Contact Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// DELETE CONTACT
// =====================================================

const deleteContact = async (req, res) => {
    try {

        const contactId = req.params.id;

        const userId = req.user.userId;

        const [contacts] = await pool.query(
            `SELECT image_path
             FROM contacts
             WHERE id = ?
             AND user_id = ?`,
            [
                contactId,
                userId
            ]
        );

        if (contacts.length === 0) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        const imagePath = contacts[0].image_path;

        // ============================================
        // DELETE DATABASE RECORD
        // ============================================

        await pool.query(
            `DELETE FROM contacts
             WHERE id = ?
             AND user_id = ?`,
            [
                contactId,
                userId
            ]
        );

        // ============================================
        // DELETE IMAGE FROM BLOB
        // ============================================

        if (imagePath) {
            await deleteImageFromBlob(imagePath);
        }

        res.status(200).json({
            message: "Contact deleted successfully"
        });

    } catch (error) {

        console.error("Delete Contact Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
};