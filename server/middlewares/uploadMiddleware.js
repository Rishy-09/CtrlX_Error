import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "./uploads";
const bugAttachmentsDir = path.join(uploadDir, "bugs");
const profileImagesDir = path.join(uploadDir, "profiles");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(bugAttachmentsDir)) {
    fs.mkdirSync(bugAttachmentsDir);
}

if (!fs.existsSync(profileImagesDir)) {
    fs.mkdirSync(profileImagesDir);
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine the upload directory based on the route
        let uploadPath = uploadDir;
        if (req.baseUrl.includes("/bugs") || req.baseUrl.includes("/comments")) {
            uploadPath = bugAttachmentsDir;
        } else if (req.baseUrl.includes("/users") || req.baseUrl.includes("/auth")) {
            uploadPath = profileImagesDir;
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
    // Accept images, documents, PDFs, etc.
    const allowedFileTypes = [
        "image/jpeg", 
        "image/png", 
        "image/gif", 
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/csv"
    ];
    
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images, PDFs, and documents are allowed."), false);
    }
};

// Configure multer with storage and file filter
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB file size limit
    }
});

export default upload;