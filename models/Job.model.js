const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const JobSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number },
  description: { type: String, required: true },
  requirements: [String],
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }], 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", JobSchema);


