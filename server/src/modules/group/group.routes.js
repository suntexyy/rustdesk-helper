const express = require("express");
const router = express.Router();
const Group = require("./group.model");
const { createGroup, getGroups } = require("./group.controller");

// GET ALL GROUPS
router.get("/", getGroups);

// CREATE GROUP
router.post("/", createGroup);

// DELETE GROUP
router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }
    res.json({ success: true, message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// CHECK GROUP CODE
router.post("/check", async (req, res) => {
  try {
    console.log(req.body);

    const { code } = req.body;

    const group = await Group.findOne({ code });

    console.log(group);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    return res.json({
      success: true,
      message: "Group exists",
      data: group,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
