const mongoose = require("mongoose");

const studentRecordSchema = new mongoose.Schema({
  rustdeskId: { type: String, required: true, unique: true },
  name: String,
  lastGroupCode: String,
  firstSeenAt: Date,
  lastSeenAt: Date,
});

module.exports =
  mongoose.models.StudentRecord ||
  mongoose.model("StudentRecord", studentRecordSchema);
