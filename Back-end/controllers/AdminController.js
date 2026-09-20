const pool = require("../config/db");

const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            "SELECT id, name, email, role, created_at FROM users"
        );

        res.json({
            users: users
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getUserContacts = async (req, res) => {
    try {
        const { id } = req.params;

        // Confirm the user exists
        const [users] = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = ?",
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const [contacts] = await pool.query(
            `SELECT id, name, phone, email, address, image_path
             FROM contacts
             WHERE user_id = ?
             ORDER BY id DESC`,
            [id]
        );

        res.json({
            user: users[0],
            contacts: contacts
        });

    } catch (error) {
        console.error("Get User Contacts Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



module.exports = {
    getAllUsers,
    getUserContacts
};