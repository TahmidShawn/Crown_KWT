import multer from "multer";
import ErrorHandler from "../utils/errorHandler.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
        files: 5,
    },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(
                new ErrorHandler(
                    "Only JPEG, PNG, or WEBP images are allowed",
                    400,
                ),
            );
        }
        cb(null, true);
    },
});

export default upload;
