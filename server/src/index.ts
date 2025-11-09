import express from "express";
import http from "http";
import { Server } from "socket.io";
import config from "./config/config";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.clientSideUrl } });

let waitingUser: { socketId: string; peerId: string } | null = null;
const rooms: Record<string, [string, string]> = {};

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("find-partner", ({ peerId }: { peerId: string }) => {
    console.log("find-partner from", socket.id, "with peerId", peerId);

    if (waitingUser) {
      const roomId = `${waitingUser.socketId}-${socket.id}`;
      rooms[roomId] = [waitingUser.socketId, socket.id];

      io.to(waitingUser.socketId).emit("partner-found", {
        roomId,
        partnerPeerId: peerId,
        shouldInitiateCall: true,
      });

      io.to(socket.id).emit("partner-found", {
        roomId,
        partnerPeerId: waitingUser.peerId,
        shouldInitiateCall: false,
      });

      waitingUser = null;
    } else {
      waitingUser = { socketId: socket.id, peerId };
      io.to(socket.id).emit("waiting");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (waitingUser && waitingUser.socketId === socket.id) {
      waitingUser = null;
    }
  });
});

server.listen(5000, () => console.log("Server running on 5000"));
