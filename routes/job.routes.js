const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Job = require("../models/Job.model");
const User = require("../models/User.model");
const {
  errorHandler,
  notFoundHandler,
} = require("../middleware/error-handler");

router.post("/", (req, res, next) => {
  const {
    title,
    company,
    location,
    salary,
    description,
    requirements,
    employer,
  } = req.body;

  if (!Array.isArray(requirements)) {
    return res
      .status(400)
      .json({ message: "Requirements must be an array of strings." });
  }
  if (!mongoose.Types.ObjectId.isValid(employer)) {
    return res.status(400).json({ message: "Invalid employer ID." });
  }

  Job.create({
    title,
    company,
    location,
    salary,
    description,
    requirements, 
    employer,
  })
    .then((job) => res.status(201).json(job))
    .catch((e) => next(e));
});


router.get("/", (req, res, next) => {
  Job.find()
    .populate("employer")
    .then((allJobs) => {
      res.status(200).json(allJobs);
    })
    .catch((e) => {
      next(e);
    });
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
router.get("/users/:userId", (req, res, next) => {
  const { userId } = req.params;
  Job.find({ employer: userId })
    .populate("employer")
    .then((jobs) => {
      res.status(200).json(jobs);
    })
    .catch((e) => {
      next(e);
    });
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
