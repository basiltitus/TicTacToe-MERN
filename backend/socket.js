const http = require("./app");
const io = require("socket.io")(http, {
  cors: {
    origin: "https://tictoetic.herokuapp.com",
  },
});
let onlineUsers = [];


io.on("connection", function (socket) {
  console.log("connected");

  socket.on("join", (room) => {
    if (!onlineUsers.includes(room)) {
      onlineUsers.push(room);
    }
    console.log(onlineUsers);
    socket.join(room);
  });

  socket.on("Gamedisconnect", function (room) {
    console.log(onlineUsers);
    onlineUsers = onlineUsers.filter(function (value, index, arr) {
      return value != room;
    });
  });

  socket.on("disconnect", function () {
    onlineUsers = [];
    socket.broadcast.emit("AttendanceCall");
    console.log("User Disconnected");
  });

  socket.on("GameRequest", (player1, player2) => {
    console.log(onlineUsers);
    console.log(
      "request to play with ",
      player2,
      " has been recieved from ",
      player1
    );
    if (onlineUsers.includes(player2)) {
      socket.broadcast.to(player2).emit("GameRequest", player1, player2);
      console.log("Request initiated");
    } else {
      io.in(player1).emit("INACTIVEOPONENT");
      console.log("Request declined " + player1);
    }
  });

  socket.on("RequestAccepted", function (player1, player2) {
    console.log("Request accepted by ", player2, " for a game with ", player1);
    socket.broadcast.to(player1).emit("RequestAccepted", player1, player2);
  });

  socket.on("RequestDeclined", function (player1, player2) {
    console.log("Request rejected by ", player2, " for a game with ", player1);
    socket.broadcast.to(player1).emit("RequestDeclined", player1, player2);
  });

  socket.on("GetOnlineList", (player1) => {
    console.log("retrieving online users by " + player1);
    io.in(player1).emit("OnlineList", onlineUsers);
  });

  socket.on("testing", () => {
    console.log("testing");
  });

  socket.on("GamePlayedX", (player1, player2, matrix) => {
    console.log("played");
    socket.broadcast.to(player2).emit("GamePlayedX", player1, player2, matrix);
  });

  socket.on("GamePlayedY", (player1, player2, matrix) => {
    console.log("played");
    socket.broadcast.to(player1).emit("GamePlayedY", player1, player2, matrix);
  });

  socket.on("GameStoppedByX", (player1, player2) => {
    console.log("Game stopped by X", player1, player2);
    socket.broadcast.to(player2).emit("GameStopped");
  });
  
  socket.on("GameStoppedByY", (player1, player2) => {
    console.log("Game stopped by Y", player1, player2);
    socket.broadcast.to(player1).emit("GameStopped");
  });

  socket.on("GameResetByY", (player1, player2) => {
    socket.broadcast.to(player1).emit("GameReset");
  });

  socket.on("GameResetByX", (player1, player2) => {
    socket.broadcast.to(player2).emit("GameReset");
  });

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
  
});
io.listen(8000);

module.exports = io;
