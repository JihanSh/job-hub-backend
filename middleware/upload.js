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
const uploadResume = multer({ storage: resumeStorage });

module.exports = { uploadImage, uploadResume };
