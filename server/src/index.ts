import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let waitingUser: string | null = null; // socket id of waiting user
const rooms: Record<string, [string, string]> = {}; // roomId -> [user1, user2]


io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  // Handle when user wants to find a partner
  socket.on("find-partner", () => {
    if (waitingUser) {
      // someone is waiting -> create room
      const roomId = `${waitingUser}-${socket.id}`;
      rooms[roomId] = [waitingUser, socket.id];

      // notify both users
      io.to(waitingUser).emit("partner-found", {
        roomId,
        partnerId: socket.id,
      });
      io.to(socket.id).emit("partner-found", {
        roomId,
        partnerId: waitingUser,
      });

      waitingUser = null;
    } else {
      // no one waiting -> set this user as waiting
      waitingUser = socket.id;
      io.to(socket.id).emit("waiting");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (waitingUser === socket.id) {
      waitingUser = null;
    }
  });
});

server.listen(5000, () => console.log("Server running on 5000"));
