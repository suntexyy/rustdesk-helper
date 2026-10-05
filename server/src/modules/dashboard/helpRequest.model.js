const mongoose = require("mongoose");

const helpRequestSchema = new mongoose.Schema({
  groupCode: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  status: {
    type: String,
    enum: ["waiting", "ongoing", "completed", "cancelled"],
    default: "waiting",
  },
  requestedAt: { type: Date, default: Date.now, index: true },
  startedAt: Date,
  completedAt: Date,
});

module.exports =
  mongoose.models.HelpRequest ||
  mongoose.model("HelpRequest", helpRequestSchema);
