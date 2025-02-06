import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } 
});

server.listen(5000, () => {
    console.log("Server started on port 5000");
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("draw", (data) => {
      socket.broadcast.emit("draw", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

      socket.on("clear", () => {
        socket.broadcast.emit("clear");
  });
});
