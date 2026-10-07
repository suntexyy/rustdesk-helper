const jwt = require("jsonwebtoken");
const Group = require("./modules/group/group.model");
const { hashKey, safeEqualHex } = require("./modules/group/group.keys");
const HelpRequest = require("./modules/dashboard/helpRequest.model");
const StudentRecord = require("./modules/dashboard/studentRecord.model");

const groupRooms = {};

const safely = (fn) =>
  Promise.resolve()
    .then(fn)
    .catch((e) => console.error("DB error:", e.message));

const clean = (v, max) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

// only allow the fields a student is supposed to send
const pickStudent = (s) => {
  const src = s && typeof s === "object" ? s : {};
  const out = {};
  if (src.name !== undefined) out.name = clean(src.name, 60);
  if (src.rustdeskId !== undefined)
    out.rustdeskId = clean(src.rustdeskId, 30).replace(/\s+/g, "");
  if (src.password !== undefined) out.password = clean(src.password, 100);
  if (src.avatar !== undefined) {
    out.avatar =
      typeof src.avatar === "string" &&
      src.avatar.startsWith("data:image/") &&
      src.avatar.length <= 30000
        ? src.avatar
        : undefined;
  }
  return out;
};

// what students see (no RustDesk ID, no password)
const toPublic = ({ socketId, name, avatar, status }) => ({
  socketId,
  name,
  avatar,
  status,
});

// what staff see (everything except internal ids)
const toStaff = ({ requestId, ...rest }) => rest;

// returns "admin", "mentor" or null
const verifyStaff = async ({ groupCode, ownerKey, adminToken }) => {
  if (adminToken && process.env.SOCKET_JWT_SECRET) {
    try {
      const payload = jwt.verify(adminToken, process.env.SOCKET_JWT_SECRET);
      if (payload.role === "admin") return "admin";
    } catch (_) {
      // invalid or expired token: fall through
    }
  }

  if (ownerKey && groupCode) {
    const group = await Group.findOne({ code: groupCode }).select(
      "+ownerKeyHash",
    );
    if (
      group?.ownerKeyHash &&
      safeEqualHex(hashKey(ownerKey), group.ownerKeyHash)
    ) {
      return "mentor";
    }
  }

  return null;
};

module.exports = (io) => {
  const buildSnapshot = () => {
    let online = 0;
    let waiting = 0;
    let ongoing = 0;
    const groups = [];
    const students = [];

    for (const [code, room] of Object.entries(groupRooms)) {
      const list = Object.values(room);
      if (list.length === 0) continue;

      const w = list.filter((s) => s.status === "waiting").length;
      const o = list.filter((s) => s.status === "ongoing").length;

      online += list.length;
      waiting += w;
      ongoing += o;
      groups.push({ code, students: list.length, waiting: w, ongoing: o });

      for (const s of list) {
        students.push({
          socketId: s.socketId,
          name: s.name,
          status: s.status,
          groupCode: code,
          joinedAt: s.joinedAt,
        });
      }
    }

    return {
      online,
      waiting,
      ongoing,
      activeGroups: groups.length,
      groups,
      students,
      updatedAt: Date.now(),
    };
  };

  const broadcastDashboard = () =>
    io.to("admins").emit("dashboard_update", buildSnapshot());

  // students get the trimmed list, staff get the full list
  const emitRoom = (groupCode) => {
    const list = Object.values(groupRooms[groupCode] || {});
    io.to(groupCode).emit("room_update", { students: list.map(toPublic) });
    io.to(`staff:${groupCode}`).emit("room_update", {
      students: list.map(toStaff),
    });
  };

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);
    socket.data = { staffGroups: new Set() };

    // ADMIN: opens the dashboard overview page
    socket.on("admin_join_dashboard", async (data) => {
      try {
        const role = await verifyStaff({ adminToken: data?.adminToken });
        if (role !== "admin") {
          return socket.emit("staff_denied", { scope: "dashboard" });
        }
        socket.join("admins");
        socket.emit("dashboard_update", buildSnapshot());
      } catch (err) {
        console.error("admin_join_dashboard failed:", err.message);
      }
    });

    // STUDENT: joins a group room
    socket.on("join_group", async (data) => {
      try {
        if (!data) return;
        const groupCode = clean(data.groupCode, 20);
        const info = pickStudent(data.student);
        if (!groupCode || !info.name || !info.rustdeskId) return;

        const exists = await Group.exists({ code: groupCode });
        if (!exists) return socket.emit("join_denied", { groupCode });

        socket.join(groupCode);
        socket.data.groupCode = groupCode;

        if (!groupRooms[groupCode]) groupRooms[groupCode] = {};
        groupRooms[groupCode][socket.id] = {
          ...info,
          socketId: socket.id,
          status: "idle",
          joinedAt: new Date(),
        };

        safely(() =>
          StudentRecord.updateOne(
            { rustdeskId: info.rustdeskId },
            {
              $set: {
                name: info.name,
                lastGroupCode: groupCode,
                lastSeenAt: new Date(),
              },
              $setOnInsert: { firstSeenAt: new Date() },
            },
            { upsert: true },
          ),
        );

        console.log(`👤 ${info.name} joined group: ${groupCode}`);

        emitRoom(groupCode);
        broadcastDashboard();
      } catch (err) {
        console.error("join_group failed:", err.message);
      }
    });

    // STAFF (admin or mentor): monitors a group
    socket.on("admin_join_group", async (data) => {
      try {
        if (!data) return;
        const groupCode = clean(data.groupCode, 20);
        if (!groupCode) return;

        const role = await verifyStaff({
          groupCode,
          ownerKey: data.ownerKey,
          adminToken: data.adminToken,
        });

        if (!role) return socket.emit("staff_denied", { groupCode });

        // staff only join the staff room, so they never get the trimmed list
        socket.join(`staff:${groupCode}`);
        socket.data.staffGroups.add(groupCode);

        console.log(`🛡️  ${role} monitoring group: ${groupCode}`);

        socket.emit("room_update", {
          students: Object.values(groupRooms[groupCode] || {}).map(toStaff),
        });
      } catch (err) {
        console.error("admin_join_group failed:", err.message);
      }
    });

    // STUDENT: updates their info
    socket.on("student_updated", (data) => {
      if (!data) return;
      const groupCode = clean(data.groupCode, 20);
      const me = groupRooms[groupCode]?.[socket.id];
      if (!me) return;

      Object.assign(me, pickStudent(data.student));

      emitRoom(groupCode);
      broadcastDashboard();
    });

    // STUDENT: requests help
    socket.on("help_requested", (data) => {
      if (!data) return;
      const groupCode = clean(data.groupCode, 20);
      const me = groupRooms[groupCode]?.[socket.id];
      if (!me) return;

      const wasWaiting = me.status === "waiting";
      me.status = "waiting";

      if (!wasWaiting) {
        safely(async () => {
          const doc = await HelpRequest.create({
            groupCode,
            studentName: me.name,
            status: "waiting",
          });
          me.requestId = String(doc._id);
        });
      }

      console.log(`🆘 Help requested by ${me.name}`);

      emitRoom(groupCode);
      broadcastDashboard();
    });

    // STAFF: starts helping a student
    socket.on("help_started", (data) => {
      if (!data) return;
      const groupCode = clean(data.groupCode, 20);
      const studentSocketId = clean(data.studentSocketId, 60);

      if (!socket.data.staffGroups.has(groupCode)) return;
      const st = groupRooms[groupCode]?.[studentSocketId];
      if (!st) return;

      st.status = "ongoing";

      safely(async () => {
        if (st.requestId) {
          await HelpRequest.findByIdAndUpdate(st.requestId, {
            status: "ongoing",
            startedAt: new Date(),
          });
        } else {
          const doc = await HelpRequest.create({
            groupCode,
            studentName: st.name,
            status: "ongoing",
            startedAt: new Date(),
          });
          st.requestId = String(doc._id);
        }
      });

      io.to(studentSocketId).emit("help_started");

      emitRoom(groupCode);
      broadcastDashboard();

      console.log(`▶️  Help started for ${st.name}`);
    });

    // STAFF: completes the help session
    socket.on("help_completed", (data) => {
      if (!data) return;
      const groupCode = clean(data.groupCode, 20);
      const studentSocketId = clean(data.studentSocketId, 60);

      if (!socket.data.staffGroups.has(groupCode)) return;
      const st = groupRooms[groupCode]?.[studentSocketId];
      if (!st) return;

      st.status = "idle";

      safely(async () => {
        if (st.requestId) {
          await HelpRequest.findByIdAndUpdate(st.requestId, {
            status: "completed",
            completedAt: new Date(),
          });
          delete st.requestId;
        }
      });

      io.to(studentSocketId).emit("help_completed");

      emitRoom(groupCode);
      broadcastDashboard();

      console.log(`✅ Help completed for ${st.name}`);
    });

    // DISCONNECT: remove student from store
    socket.on("disconnect", () => {
      // staff sockets never set groupCode, so this only runs for students
      const { groupCode } = socket.data || {};
      if (!groupCode) return;

      const gone = groupRooms[groupCode]?.[socket.id];
      if (!gone) return;

      if (gone.requestId && gone.status !== "idle") {
        safely(() =>
          HelpRequest.findByIdAndUpdate(gone.requestId, {
            status: "cancelled",
            completedAt: new Date(),
          }),
        );
      }

      delete groupRooms[groupCode][socket.id];

      console.log(`👋 ${gone.name} disconnected from group ${groupCode}`);

      emitRoom(groupCode);
      broadcastDashboard();
    });
  });
};
