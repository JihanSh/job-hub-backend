const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Application = require("../models/Application.model");
const {uploadResume} = require("../middleware/upload");
const {
  errorHandler,
  notFoundHandler,
} = require("../middleware/error-handler");

router.post(
  "/applications",
  uploadResume.single("resume"),
  async (req, res, next) => {
    try {
      const { job, user, coverLetter } = req.body;

      if (!job || !user || !req.file) {
        return res
          .status(400)
          .json({ message: "Job, user, and resume are required fields." });
      }

      if (!mongoose.Types.ObjectId.isValid(job)) {
        return res.status(400).json({ message: "Invalid job ID." });
      }
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({ message: "Invalid user ID." });
      }

      const resume = req.file.path;
      const application = await Application.create({
        job,
        user,
        resume,
        coverLetter,
      });

      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/applications", (req, res, next) => {
  Job.find()
    .populate("user", "job")
    .then((allApplications) => {
      res.status(200).json(allApplications);
    })
    .catch((e) => {
      next(e);
    });
});

router.get("/applications/:applicationId", (req, res, next) => {
  const { applicationId } = req.params;
  Job.findById(applicationId)
    .populate("user", "job")
    .then((application) => {
      res.status(200).json(application);
    })
    .catch((e) => next(e));
});

router.use(notFoundHandler);
router.use(errorHandler);
module.exports = router;
