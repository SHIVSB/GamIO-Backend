const http = require("http");
const createError = require("http-errors");
const express = require("express");
const PORT = process.env.PORT;
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const dbConfig = require("./src/services/dbConfig");
const dotenv = require("dotenv");
const { errorHandler, notFound } = require("./src/middlewares/error");

dotenv.config();

const apiRouter = require("./routes/api");
dbConfig();
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/api", apiRouter);
// Console.log(process);

// call error handler after all your routes
app.use(notFound);
app.use(errorHandler);

// Connecting to socket

const users = [];

const addUser = ({ id, name, room }) => {
  const existingUser = users.find((user) => {
    user.room === room && user.name === name;
  });

  if (existingUser) {
    return { error: "Username is taken" };
  }

  const user = { id, name, room };

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback(error);
    }

    // Emit will send message to the user
    // who had joined
    socket.emit("message", {
      user: "admin",
      text: `${user.name},
          welcome to room ${user.room}.`,
    });

    // Broadcast will send message to everyone
    // in the room except the joined user
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined` });

    socket.join(user.room);

    io.to(user?.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} had left`,
      });
    }
  });
});

server.listen(PORT, (err) => {
  if (err) {
    console.log("Error in starting server ..");
  }

  console.log(`Server started successfully on PORT : ${PORT}`);
});
