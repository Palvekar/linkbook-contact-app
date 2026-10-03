const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Upload a buffer to Blob Storage, returns the public URL
async function uploadImageToBlob(buffer, fileName, mimetype) {
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: mimetype }
    });

    return blockBlobClient.url;
}

// Delete a blob given its full URL (extracts the blob name from the URL)
async function deleteImageFromBlob(imageUrl) {
    if (!imageUrl) return;

    try {
        const url = new URL(imageUrl);
        // pathname looks like: /contact-images/1-23-photo.jpg
        const blobName = decodeURIComponent(
            url.pathname.split("/").slice(2).join("/")
        );

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
    } catch (error) {
        console.error("Blob delete error:", error);
    }
}

module.exports = { uploadImageToBlob, deleteImageFromBlob };