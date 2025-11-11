import express from "express";
import http from "http";
import { Server } from "socket.io";
import config from "./config/config";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const waitingQueue: Array<{ socketId: string; peerId: string }> = [];
const activeRooms = new Map<
  string,
  { users: [string, string]; createdAt: number }
>();

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("find-partner", ({ peerId }: { peerId: string }) => {
    const alreadyWaiting = waitingQueue.some((u) => u.socketId === socket.id);
    
    if (alreadyWaiting) {
      return;
    }

    if (waitingQueue.length > 0) {
      const partner = waitingQueue.shift()!;
      const roomId = `${partner.socketId}-${socket.id}`;

      activeRooms.set(roomId, {
        users: [partner.socketId, socket.id],
        createdAt: Date.now(),
      });

      socket.join(roomId);
      io.sockets.sockets.get(partner.socketId)?.join(roomId);

      io.to(partner.socketId).emit("partner-found", {
        roomId,
        partnerPeerId: peerId,
        shouldInitiateCall: true,
      });

      io.to(socket.id).emit("partner-found", {
        roomId,
        partnerPeerId: partner.peerId,
        shouldInitiateCall: false,
      });
    } else {
      waitingQueue.push({ socketId: socket.id, peerId });
      io.to(socket.id).emit("waiting");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);

    const index = waitingQueue.findIndex((u) => u.socketId === socket.id);
    if (index !== -1) {
      waitingQueue.splice(index, 1);
    }

    for (const [roomId, room] of activeRooms.entries()) {
      if (room.users.includes(socket.id)) {
        const partnerId = room.users.find((id) => id !== socket.id);
        if (partnerId) {
          io.to(partnerId).emit("partner-disconnected");
        }
        activeRooms.delete(roomId);
      }
    }
  });

  socket.on("skip-partner", () => {
    socket.emit("partner-disconnected");
    socket.emit("find-partner", { peerId: socket.id });
  });
});

// Cleanup old rooms (optional)
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of activeRooms.entries()) {
    // Remove rooms older than 1 hour
    if (now - room.createdAt > 3600000) {
      activeRooms.delete(roomId);
    }
  }
}, 300000); // Run every 5 minutes

server.listen(5000, () => console.log(`Server running on ${config.port}`));
