const http = require("http");
var createError = require("http-errors");
var express = require("express");
const PORT = 4000 || process.env.PORT;
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var dbConfig = require("./src/services/dbConfig");
var dotenv = require("dotenv");
const { errorHandler, notFound } = require("./src/middlewares/error");
const socketio = require("socket.io");

dotenv.config();

var apiRouter = require("./routes/api");
dbConfig();
var app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/api", apiRouter);
// console.log(process);

//call error handler after all your routes
app.use(notFound);
app.use(errorHandler);

//Connecting to socket

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./src/socket/users/users");

io.on("connect", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback(error);
    }

    socket.emit("message", {
      user: "GamIO",
      text: `${user.firstName}, Have a good time chatting!!`,
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, function (err) {
  if (err) {
    console.log("Error in starting server ..");
  }

  console.log(`Server started successfully on PORT : ${PORT}`);
});
