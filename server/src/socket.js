const HelpRequest = require("../modules/dashboard/helpRequest.model");
const StudentRecord = require("../modules/dashboard/studentRecord.model");
const groupRooms = {};

const safely = (fn) =>
  Promise.resolve()
    .then(fn)
    .catch((e) => console.error("Dashboard DB error:", e.message));

module.exports = (io) => {
  const buildSnapshot = () => {
    let online = 0;
    let waiting = 0;
    let ongoing = 0;
    const groups = [];
    const students = [];

    for (const [code, room] of Object.entries(groupRooms)) {
      const list = Object.values(room);
      if (list.length === 0) continue; // skip empty groups

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

  // send the summary to every admin who has the dashboard open
  const broadcastDashboard = () =>
    io.to("admins").emit("dashboard_update", buildSnapshot());

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    // admin opens the dashboard overview page
    socket.on("admin_join_dashboard", () => {
      socket.join("admins");
      socket.emit("dashboard_update", buildSnapshot());
    });

    // ─────────────────────────────────────────
    // STUDENT: joins a group room
    // ─────────────────────────────────────────
    socket.on("join_group", (data) => {
      console.log("JOIN_GROUP EVENT RECEIVED");
      console.log(data);

      if (!data) return;
      const { groupCode, student } = data;
      if (!groupCode || !student) return;

      socket.join(groupCode);
      socket.data = { groupCode, student };

      // Add/update student in the in-memory store
      if (!groupRooms[groupCode]) groupRooms[groupCode] = {};
      groupRooms[groupCode][socket.id] = {
        ...student,
        socketId: socket.id,
        status: "idle",
        joinedAt: new Date(),
      };

      // ➕ remember this student (unique by RustDesk ID)
      const rid = String(student.rustdeskId || "").replace(/\s+/g, "");
      if (rid) {
        safely(() =>
          StudentRecord.updateOne(
            { rustdeskId: rid },
            {
              $set: {
                name: student.name,
                lastGroupCode: groupCode,
                lastSeenAt: new Date(),
              },
              $setOnInsert: { firstSeenAt: new Date() },
            },
            { upsert: true },
          ),
        );
      }

      console.log(`👤 ${student.name} joined group: ${groupCode}`);

      // Broadcast updated list to everyone in room (including admin)
      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });
      broadcastDashboard();
    });

    // ─────────────────────────────────────────
    // ADMIN: joins a group room to monitor it
    // ─────────────────────────────────────────
    socket.on("admin_join_group", (data) => {
      if (!data) return;
      const { groupCode } = data;
      if (!groupCode) return;
      console.log("ADMIN ROOM:", groupCode);

      socket.join(groupCode);
      socket.data = { groupCode, isAdmin: true };

      console.log(`🛡️  Admin monitoring group: ${groupCode}`);

      // Send current snapshot immediately so admin sees existing students
      socket.emit("room_update", {
        students: Object.values(groupRooms[groupCode] || {}),
      });
    });

    // ─────────────────────────────────────────
    // STUDENT: updates their info (name/id/pass)
    // ─────────────────────────────────────────
    socket.on("student_updated", (data) => {
      if (!data) return;
      const { groupCode, student } = data;
      if (!groupCode || !groupRooms[groupCode]?.[socket.id]) return;

      groupRooms[groupCode][socket.id] = {
        ...groupRooms[groupCode][socket.id],
        ...student,
      };

      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });
      broadcastDashboard();
    });

    // ─────────────────────────────────────────
    // STUDENT: requests help
    // ─────────────────────────────────────────
    socket.on("help_requested", (data) => {
      if (!data) return;
      const { groupCode } = data;
      if (!groupCode || !groupRooms[groupCode]?.[socket.id]) return;

      const me = groupRooms[groupCode][socket.id];
      const wasWaiting = me.status === "waiting";
      me.status = "waiting";

      // ➕ save the request (but not twice if they click again)
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

      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });
      broadcastDashboard();
    });

    // ─────────────────────────────────────────
    // ADMIN: starts helping a student
    // ─────────────────────────────────────────
    socket.on("help_started", (data) => {
      if (!data) return;
      const { groupCode, studentSocketId } = data;
      if (!groupCode || !groupRooms[groupCode]?.[studentSocketId]) return;

      const st = groupRooms[groupCode][studentSocketId];
      st.status = "ongoing";

      // ➕ update (or create) the saved request
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

      // Tell that specific student their session is starting
      io.to(studentSocketId).emit("help_started");

      // Update the full room list
      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });
      broadcastDashboard();

      console.log(`▶️  Help started for ${st.name}`);
    });

    // ─────────────────────────────────────────
    // ADMIN: completes the help session
    // ─────────────────────────────────────────
    socket.on("help_completed", (data) => {
      if (!data) return;
      const { groupCode, studentSocketId } = data;
      if (!groupCode || !groupRooms[groupCode]?.[studentSocketId]) return;

      const st = groupRooms[groupCode][studentSocketId];
      st.status = "idle";

      // ➕ mark the saved request as completed
      safely(async () => {
        if (st.requestId) {
          await HelpRequest.findByIdAndUpdate(st.requestId, {
            status: "completed",
            completedAt: new Date(),
          });
          delete st.requestId;
        }
      });

      // Tell the student the session is done
      io.to(studentSocketId).emit("help_completed");

      // Update the full room list
      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });
      broadcastDashboard();

      console.log(`✅ Help completed for ${st.name}`);
    });

    // ─────────────────────────────────────────
    // DISCONNECT: remove student from store
    // ─────────────────────────────────────────
    socket.on("disconnect", () => {
      const { groupCode, isAdmin } = socket.data || {};

      // Admins don't have entries in the store
      if (isAdmin || !groupCode) return;

      if (groupRooms[groupCode]?.[socket.id]) {
        const gone = groupRooms[groupCode][socket.id];
        const name = gone.name;

        // ➕ a student who leaves mid-request is marked cancelled
        if (gone.requestId && gone.status !== "idle") {
          safely(() =>
            HelpRequest.findByIdAndUpdate(gone.requestId, {
              status: "cancelled",
              completedAt: new Date(),
            }),
          );
        }

        delete groupRooms[groupCode][socket.id];

        console.log(`👋 ${name} disconnected from group ${groupCode}`);

        io.to(groupCode).emit("room_update", {
          students: Object.values(groupRooms[groupCode]),
        });
        broadcastDashboard();
      }
    });
  });
};
