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

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/login", (req, res) => {
  req.body.points = 0;

  User.findOne({ emailId: req.body.emailId }, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user == null) {
        user = new User(req.body);
        user.save().then(() => console.log("Acc"));
      return  res.status(201).send({ data: user,status:201});
      }

     return res.status(200).send({ data: user,status:200 });
    }
  });
});

app.get('/ranklist',(req,res)=>{
    User.find({}).sort('points').exec((err, docs) => { 
        res.status(200).send({data:docs,status:200})
     });
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
