const groupRooms = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

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

      console.log(`👤 ${student.name} joined group: ${groupCode}`);

      // Broadcast updated list to everyone in room (including admin)
      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });
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
    });

    // ─────────────────────────────────────────
    // STUDENT: requests help
    // ─────────────────────────────────────────
    socket.on("help_requested", (data) => {
      if (!data) return;
      const { groupCode } = data;
      if (!groupCode || !groupRooms[groupCode]?.[socket.id]) return;

      groupRooms[groupCode][socket.id].status = "waiting";

      console.log(
        `🆘 Help requested by ${groupRooms[groupCode][socket.id].name}`,
      );

      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });
    });

    // ─────────────────────────────────────────
    // ADMIN: starts helping a student
    // ─────────────────────────────────────────
    socket.on("help_started", (data) => {
      if (!data) return;
      const { groupCode, studentSocketId } = data;
      if (!groupCode || !groupRooms[groupCode]?.[studentSocketId]) return;

      groupRooms[groupCode][studentSocketId].status = "ongoing";

      // Tell that specific student their session is starting
      io.to(studentSocketId).emit("help_started");

      // Update the full room list
      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });

      console.log(
        `▶️  Help started for ${groupRooms[groupCode][studentSocketId].name}`,
      );
    });

    // ─────────────────────────────────────────
    // ADMIN: completes the help session
    // ─────────────────────────────────────────
    socket.on("help_completed", (data) => {
      if (!data) return;
      const { groupCode, studentSocketId } = data;
      if (!groupCode || !groupRooms[groupCode]?.[studentSocketId]) return;

      groupRooms[groupCode][studentSocketId].status = "idle";

      // Tell the student the session is done
      io.to(studentSocketId).emit("help_completed");

      // Update the full room list
      io.to(groupCode).emit("room_update", {
        students: Object.values(groupRooms[groupCode]),
      });

      console.log(
        `✅ Help completed for ${groupRooms[groupCode][studentSocketId].name}`,
      );
    });

    // ─────────────────────────────────────────
    // DISCONNECT: remove student from store
    // ─────────────────────────────────────────
    socket.on("disconnect", () => {
      const { groupCode, isAdmin } = socket.data || {};

      // Admins don't have entries in the store
      if (isAdmin || !groupCode) return;

      if (groupRooms[groupCode]?.[socket.id]) {
        const name = groupRooms[groupCode][socket.id].name;
        delete groupRooms[groupCode][socket.id];

        console.log(`👋 ${name} disconnected from group ${groupCode}`);

        io.to(groupCode).emit("room_update", {
          students: Object.values(groupRooms[groupCode]),
        });
      }
    });
  });
};
