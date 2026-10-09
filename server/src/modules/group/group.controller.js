const Group = require("./group.model");
const { hashKey, newOwnerKey, newGroupCode } = require("./group.keys");
const { notifyGroupClosed } = require("./group.notify");

// CREATE GROUP (admin)
exports.createGroup = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const group = await Group.create({ name, code });
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

// GET ALL GROUPS (admin)
exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find();
    res.status(200).json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
};

// CREATE GROUP (mentor): one per mentorId, returns the secret owner key once
exports.createMentorGroup = async (req, res, next) => {
  try {
    const name = String(req.body.name || "")
      .trim()
      .slice(0, 60);
    const mentorId = String(req.body.mentorId || "");

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Group name is required" });
    }
    if (!/^[0-9a-f-]{36}$/i.test(mentorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mentor id" });
    }
    if (await Group.exists({ mentorId })) {
      return res
        .status(409)
        .json({ success: false, message: "You already have a group" });
    }

    const ownerKey = newOwnerKey();

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const group = await Group.create({
          name,
          code: newGroupCode(),
          ownerType: "mentor",
          mentorId,
          ownerKeyHash: hashKey(ownerKey),
        });

        return res.status(201).json({
          success: true,
          data: {
            _id: group._id,
            name: group.name,
            code: group.code,
            ownerKey,
          },
        });
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.mentorId) {
          return res
            .status(409)
            .json({ success: false, message: "You already have a group" });
        }
        if (err.code === 11000) continue; // code collision, try another code
        throw err;
      }
    }

    res.status(503).json({
      success: false,
      message: "Could not generate a code, try again",
    });
  } catch (err) {
    next(err);
  }
};

// DELETE GROUP (mentor): the owner key itself identifies the group
exports.deleteMentorGroup = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!key) {
      return res
        .status(401)
        .json({ success: false, message: "Missing owner key" });
    }

    const group = await Group.findOneAndDelete({
      ownerKeyHash: hashKey(key),
      ownerType: "mentor",
    });

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    await notifyGroupClosed(group.code);

    res.json({ success: true, message: "Group deleted" });
    res.json({ success: true, message: "Group deleted" });
  } catch (err) {
    next(err);
  }
};
