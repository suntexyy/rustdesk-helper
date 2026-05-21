const Group = require("./group.model");

// CREATE GROUP
exports.createGroup = async (req, res, next) => {
  try {
    const { name, code } = req.body;

    const group = await Group.create({
      name,
      code,
    });
    console.log("CREATED GROUP:", group);

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL GROUPS
exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find();

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (err) {
    next(err);
  }
};
