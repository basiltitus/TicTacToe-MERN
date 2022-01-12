var cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./Model/User");
var random_name = require("node-random-name");
const PORT = process.env.PORT || 5000;
mongoose.connect(
  process.env.PORT
    ? "mongodb+srv://basil:68310111@cluster0.m9syr.mongodb.net/TicTacToe?retryWrites=true&w=majority"
    : "mongodb://localhost:27017/TicTacToe",{useNewUrlParser: true});
const app = express();
app.use(
  cors({
    origin: ["https://tictoetic.herokuapp.com"],
  })
);
app.use(express.json());
const http = (module.exports = require("http").Server(app));
const io = require("./socket");

app.get("/", (req, res) => {
  res.send("Hello World!" + PORT);
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
  if (nickname == "") console.log(random_name({ last: true }));
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
        return res.status(200).send({ data: data[0], status: 200 });
      }
    }
  });
});

http.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
