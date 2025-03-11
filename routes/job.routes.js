const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const Job = require("../models/Job.model");
const User = require("../models/User.model");
const Application = require("../models/Application.model");
const {
  errorHandler,
  notFoundHandler,
} = require("../middleware/error-handler");

router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const { title, company, location, salary, description, requirements } =
      req.body;

    if (!req.payload) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Please log in to post a job." });
    }

    if (!Array.isArray(requirements)) {
      return res
        .status(400)
        .json({ message: "Requirements must be an array of strings." });
    }

    const job = await Job.create({
      title,
      company,
      location,
      salary,
      description,
      requirements,
      employer: req.payload._id, 
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});


router.get("/", async (req, res, next) => {
  try {
    const { title, location } = req.query;
    let filter = {};

    if (title) {
      filter.title = new RegExp(title, "i"); 
    }

    if (location) {
      filter.location = new RegExp(location, "i"); 
    }

    const jobs = await Job.find(filter).populate("employer");
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
});


router.get("/:jobId", (req, res, next) => {
  const { jobId } = req.params;
  Job.findById(jobId)
    .populate("employer")
    .then((job) => {
      res.status(200).json(job);
    })
    .catch((e) => next(e));
});

// get all jobs posted by a single employer
router.get("/users/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const jobs = await Job.find({ employer: userId }).populate("employer");
    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({ job: job._id }).populate(
          "user"
        );
        return { ...job.toObject(), applications }; 
      })
    );

    res.status(200).json(jobsWithApplications);
  } catch (error) {
    next(error);
  }
});


router.put("/:jobId", (req, res, next) => {
  const { jobId } = req.params;
  Job.findByIdAndUpdate(jobId, req.body, { new: true })
    .then((job) => {
      res.status(200).json(job);
    })
    .catch((e) => {
      next(e);
    });
});

router.delete("/:jobId", (req, res, next) => {
  const { jobId } = req.params;
  Job.findByIdAndDelete(jobId)
    .then(() => {
      res.status(204).send();
    })
    .catch((e) => {
      next(e);
    });
});

router.use(notFoundHandler);
router.use(errorHandler);
module.exports = router;
