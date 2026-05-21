const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    example: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    color: {
      type: String,
      required: true,
      trim: true,
      match: /^#([0-9A-Fa-f]{6})$/, // hex validation (#FFFFFF)
    },
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
