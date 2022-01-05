const Login = require("./Operations/login");
var cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./Model/User");
mongoose.connect("mongodb://localhost:27017/TicTacToe");

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

const http = require("http").Server(app);
const io = require("socket.io")(http);
let onlineUsers = [];
io.on("connection", function (socket) {
  console.log("connected");

  socket.on("join", (room) => {
    if (!onlineUsers.includes(room)) onlineUsers.push(room);
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
      socket.broadcast.to(player1).emit("INACTIVEOPONENT");
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
});
io.listen(8000);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/login", (req, res) => {
  req.body.points = 0;
  req.body.nickName = "";

  User.findOne({ emailId: req.body.emailId }, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user == null) {
        user = new User(req.body);
        user.save().then(() => console.log("Acc"));
        return res.status(201).send({ data: user, status: 201 });
      }

      return res.status(200).send({ data: user, status: 200 });
    }
  });
});

app.get("/ranklist", (req, res) => {
  User.find({})
    .sort({ points: -1 })
    .exec((err, docs) => {
      res.status(200).send({ data: docs, status: 200 });
    });
});

app.get("/updatepoints", (req, res) => {
  const { emailId, points } = req.query;
  console.log(emailId, points);

  User.findOne({ emailId: emailId }, (err, user) => {
    if (err) console.log(err);
    else {
      if (user == null) {
      } else {
        const userRecord = user;
        const updatedPoints = userRecord.points + parseInt(points);
        User.findOneAndUpdate(
          { emailId: emailId },
          { points: updatedPoints },
          { new: true },
          function (err, docs) {
            if (err) {
              console.log(err);
            } else {
              return res.status(200).send({ data: docs, status: 200 });
            }
          }
        );
      }
    }
  });
});

app.get("/updatenickname", (req, res) => {
  const { nickname, email } = req.query;
  User.find({ nickName: nickname }, (err, data) => {
    if (err) console.log(err);
    else {
      if (data.length == 0) {
        console.log("no previous data found");
        User.findOneAndUpdate(
          { emailId: email },
          { nickName: nickname },
          null,
          (err, doc) => {
            if (err) console.log(err);
            else {
              console.log("updated");
              return res.status(200).send({ data: null, status: 200 });
            }
          }
        );
      } else {
        console.log(data);
        return res.status(409).send({ data: null, status: 409 });
      }
    }
  });
});

app.get("/checknickname", (req, res) => {
  const { nickname } = req.query;
  User.find({ nickName: nickname }, (err, data) => {
    if (err) console.log(err);
    else {
      if (data.length == 0) {
        return res.status(404).send({ data: null, status: 404 });
      } else {
        return res.status(409).send({ data: data[0], status: 409 });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
