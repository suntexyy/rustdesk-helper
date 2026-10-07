const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    code: { type: String, required: true, unique: true },

    // "admin" groups are created by the admin; "mentor" groups by a mentor
    ownerType: { type: String, enum: ["admin", "mentor"], default: "admin" },

    // random id kept in the mentor's browser (limits a mentor to 1 group)
    mentorId: { type: String, unique: true, sparse: true, select: false },

    // only a hash is stored, never the key itself
    ownerKeyHash: { type: String, select: false, index: true },

    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Group", groupSchema);
