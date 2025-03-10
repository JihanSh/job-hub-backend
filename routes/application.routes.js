const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Application = require("../models/Application.model");
const { uploadResume } = require("../middleware/upload");
const {
  errorHandler,
  notFoundHandler,
} = require("../middleware/error-handler");

router.get("/test", (req, res, next) => {
  res.json("helloooooo");
});

router.post(
  "/:jobId",
  uploadResume.single("resume"),
  async (req, res, next) => {
    console.log(req.file);
    try {
      const { jobId } = req.params;
      const { user, coverLetter } = req.body; 

      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid job ID." });
      }
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({ message: "Invalid user ID." });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Resume is required." });
      }
      const resumeUrl = req.file.path; 
      const application = new Application({
        job: jobId,
        user,
        coverLetter,
        resume: resumeUrl,
        status: "pending",
      });

      await application.save();

      res
        .status(201)
        .json({ message: "Application submitted successfully!", application });
    } catch (error) {
      next(error);
    }
  }
);



router.get("/", (req, res, next) => {
  Application.find()
    .then((allApplications) => {
      res.status(200).json(allApplications);
    })
    .catch((e) => {
      next(e);
    });
});

router.get("/:applicationId", (req, res, next) => {
  const { applicationId } = req.params;
  Application.findById(applicationId)
    .populate("user job")
    .then((application) => {
      res.status(200).json(application);
    })
    .catch((e) => next(e));
});


router.get("/users/:userId", (req, res, next) => {
  const { userId } = req.params;
  Application.find({ employer: userId })
    .populate("user job")
    .then((applications) => {
      res.status(200).json(applications);
    })
    .catch((e) => {
      next(e);
    });
});

router.use(notFoundHandler);
router.use(errorHandler);
module.exports = router;
