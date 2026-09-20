const pool = require("./config/db");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

async function migrateImageHashes() {
    try {
        const [contacts] = await pool.query(`
            SELECT id, image_path
            FROM contacts
            WHERE image_path IS NOT NULL
            AND image_hash IS NULL
        `);

        console.log(`Found ${contacts.length} contacts to process.`);

        for (const contact of contacts) {

            let imagePath;

            if (contact.image_path.startsWith("uploads")) {
                imagePath = path.join(
                    __dirname,
                    contact.image_path
                );
            } else {
                imagePath = path.join(
                    __dirname,
                    "uploads",
                    contact.image_path
                );
            }

            if (!fs.existsSync(imagePath)) {
                console.log(
                    `Image not found for contact ${contact.id}: ${imagePath}`
                );
                continue;
            }

            const imageBuffer = fs.readFileSync(imagePath);

            const imageHash = crypto
                .createHash("sha256")
                .update(imageBuffer)
                .digest("hex");

            await pool.query(
                `
                UPDATE contacts
                SET image_hash = ?
                WHERE id = ?
                `,
                [imageHash, contact.id]
            );

            console.log(
                `Updated contact ${contact.id}: ${imageHash}`
            );
        }

        console.log("Image hash migration completed.");

    } catch (error) {
        console.error("Migration error:", error);
    } finally {
        await pool.end();
    }
}

migrateImageHashes();