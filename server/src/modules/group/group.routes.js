const express = require("express");
const router = express.Router();
const Group = require("./group.model");
const { protectAdmin } = require("../auth/auth.middleware");
const { notifyGroupClosed } = require("./group.notify");
const {
  createGroup,
  getGroups,
  createMentorGroup,
  deleteMentorGroup,
} = require("./group.controller");

//
// PUBLIC ROUTES (students and mentors)
//

// CHECK GROUP CODE (returns only what a student needs)
router.post("/check", async (req, res) => {
  try {
    const code = String(req.body?.code || "");
    const group = await Group.findOne({ code }).select("name code");

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    return res.json({ success: true, message: "Group exists", data: group });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// MENTOR: create / delete their own group
router.post("/mentor", createMentorGroup);
router.delete("/mentor/me", deleteMentorGroup);

//
// 🔒 ADMIN ROUTES
//
router.use(protectAdmin);

router.get("/", getGroups);
router.post("/", createGroup);

router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    await notifyGroupClosed(group.code); // ➕ NEW

    res.json({ success: true, message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
