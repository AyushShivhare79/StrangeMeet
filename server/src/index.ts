import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let waitingUser: { socketId: string; peerId: string } | null = null; // waiting user with both IDs
const rooms: Record<string, [string, string]> = {}; // roomId -> [user1, user2]

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  
  // Handle when user wants to find a partner
  socket.on("find-partner", ({ peerId }: { peerId: string }) => {
    console.log("find-partner from", socket.id, "with peerId", peerId);
    
    if (waitingUser) {
      // someone is waiting -> create room
      const roomId = `${waitingUser.socketId}-${socket.id}`;
      rooms[roomId] = [waitingUser.socketId, socket.id];

      // notify both users with peer IDs
      // First user (waiting) should initiate the call
      io.to(waitingUser.socketId).emit("partner-found", {
        roomId,
        partnerPeerId: peerId,
        shouldInitiateCall: true, // waiting user initiates
      });
      io.to(socket.id).emit("partner-found", {
        roomId,
        partnerPeerId: waitingUser.peerId,
        shouldInitiateCall: false, // new user just waits for call
      });

      waitingUser = null;
    } else {
      // no one waiting -> set this user as waiting
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
