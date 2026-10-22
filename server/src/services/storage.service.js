import ImageKit from "@imagekit/nodejs";
import logger from "../utils/logger.js";
import ErrorHandler from "../utils/errorHandler.js";

const imageKit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(buffer, originalName, folder = "misc") {
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${originalName}`;

    try {
        const result = await imageKit.files.upload({
            file: buffer.toString("base64"),
            fileName: uniqueFileName,
            folder: `/cake-shop/${folder}`,
        });

        return { url: result.url, fileId: result.fileId };
    } catch (error) {
        logger.error({ err: error }, "ImageKit upload failed");
        throw new ErrorHandler("Failed to upload image, please try again", 502);
    }
}

async function deleteFile(fileId) {
    if (!fileId) return;

    try {
        await imageKit.files.delete(fileId);
    } catch (error) {
        logger.error({ err: error, fileId }, "ImageKit delete failed");
    }
}

export { uploadFile, deleteFile };
