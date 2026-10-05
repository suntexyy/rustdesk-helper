import { io } from "socket.io-client";

export const socket = io("https://rustdesk-helper-kf61.vercel.app", {
  withCredentials: true,
});
