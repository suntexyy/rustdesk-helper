import { io } from "socket.io-client";

const isLocal =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const SOCKET_URL = isLocal
  ? "http://localhost:5000"
  : process.env.NEXT_PUBLIC_SOCKET_URL;

export const socket = io(SOCKET_URL ?? "", {
  withCredentials: true,
  autoConnect: false,
});

// No socket server configured (e.g. on Vercel): make connect() do nothing
if (!SOCKET_URL) {
  socket.connect = () => socket;
  socket.open = () => socket;
}
