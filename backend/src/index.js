import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import { app } from "./app.js";
import { Server } from "socket.io";

dotenv.config();

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
      });

      socket.on("new message", (newMessage) => {
        var chat = newMessage.chatId;
        chat.users.forEach((user) => {
          if (user._id === newMessage.sender._id) return;
          io.to(user._id).emit("message recieved", newMessage);
        });
      });

      socket.off("setup", () => {
        socket.leave(userData._id);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
