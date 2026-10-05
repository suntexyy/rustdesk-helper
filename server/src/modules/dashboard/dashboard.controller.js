const HelpRequest = require("./helpRequest.model");
const StudentRecord = require("./studentRecord.model");
const Group = require("../group/group.model"); // ⚠️ check this file name

const safeTz = (tz) => {
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const tz = safeTz(req.query.tz);

    // the browser sends "midnight today" in the admin's own timezone
    let startOfToday = new Date(req.query.since);
    if (isNaN(startOfToday)) {
      startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);
    }
    const weekStart = new Date(
      startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000,
    );

    const [totalStudents, totalGroups, requestsToday, perDay, recent] =
      await Promise.all([
        StudentRecord.countDocuments(),
        Group.countDocuments(),
        HelpRequest.countDocuments({ requestedAt: { $gte: startOfToday } }),
        HelpRequest.aggregate([
          { $match: { requestedAt: { $gte: weekStart } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$requestedAt",
                  timezone: tz,
                },
              },
              count: { $sum: 1 },
            },
          },
          { $project: { _id: 0, date: "$_id", count: 1 } },
        ]),
        HelpRequest.find()
          .sort({ requestedAt: -1 })
          .limit(10)
          .select(
            "studentName groupCode status requestedAt startedAt completedAt",
          )
          .lean(),
      ]);

    res.json({
      success: true,
      data: { totalStudents, totalGroups, requestsToday, perDay, recent },
    });
  } catch (err) {
    next(err);
  }
};
