const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");

const Application = require("../models/Application.model");
const Job = require("../models/Job.model"); // ✅ You were missing this
const User = require("../models/User.model"); // ✅ Needed for applicant info

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

      const job = await Job.findById(jobId).populate("employer");
      const applicant = await User.findById(user);

      if (job && job.employer && job.employer.email) {
        try {
          await sendEmail({
            to: job.employer.email,
            subject: `New Application for ${job.title}`,
            text: `Hi ${job.employer.name},

You have received a new application for your job posting "${job.title}" from ${applicant.name}.

Log in to your dashboard to review the application and resume.

Best,
Your Job Board Team`,
          });
        } catch (emailErr) {
          console.warn("Failed to send email notification:", emailErr);
        }
      }

      await application.save();

      res.status(201).json({
        message: "Application submitted successfully!",
        application,
      });
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
    .catch((e) => next(e));
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
  Application.find({ user: userId })
    .populate("user job")
    .then((applications) => {
      res.status(200).json(applications);
    })
    .catch((e) => next(e));
});

router.put(
  "/:applicationId",
  uploadResume.single("resume"),
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { coverLetter, status } = req.body;
      let resumeUrl = req.file ? req.file.path : undefined;

      if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID." });
      }

      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found." });
      }

      if (coverLetter) application.coverLetter = coverLetter;
      if (status) application.status = status;
      if (resumeUrl) application.resume = resumeUrl;

      await application.save();

      res.status(200).json({
        message: "Application updated successfully!",
        application,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.use(notFoundHandler);
router.use(errorHandler);

module.exports = router;
