const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_profiles",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Storage for resumes
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
  },
});

// Multer upload functions
const uploadImage = multer({ storage: imageStorage });
const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    console.log("File MIME type:", file.mimetype);
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      console.log("❌ Invalid file type:", file.mimetype);
      return cb(new Error("Invalid file format"), false);
    }

    cb(null, true);
  },
});

module.exports = { uploadImage, uploadResume };
