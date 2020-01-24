const express = require("express");
const csv = require("csv-parser");
const createObjectCsvWriter = require("csv-writer").createObjectCsvWriter;
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();
const path = require("path");
const uuid = require("uuid");
const users = [];
let port = process.env.PORT || 8080;

fs.createReadStream("./users.csv")
    .pipe(csv())
    .on("data", user => {
        users.push(user);
    });

const csvWriter = new createObjectCsvWriter({
    path: "users.csv",
    header: [
        "username",
        "firstName",
        "lastName",
        "email",
        "age",
        "userId",
        "timeCreated"
    ],
    append: true
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} for ${req.url}`);
    next();
});

app.get("/createUser", (req, res) => {
    res.render("createUser");
});

app.post("/createUser", (req, res) => {
    const d = new Date();
    const firstName = req.body["first-name"];
    const user = {
        username: req.body["user-name"],
        firstName,
        lastName: req.body["last-name"],
        email: req.body["email-address"],
        age: req.body["age"],
        userId: uuid.v4(),
        timeCreated: d.toLocaleString()
    };
    users.push(user);
    csvWriter.writeRecords([user]).then(() => {
        console.log("User written to csv file");
    });
    res.redirect("../allUsers");
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/allUsers", (req, res) => {
    res.render("usersList", {users});
});

app.get("/allUsers/:userId", (req, res) => {
    const user = users.filter(user => user.userId === req.params.userId)[0];
    if (user) {
        res.render("editUser", {user});
    } else {
        res.send("That user does not exist");
    }
});

app.listen(port, () => {
    console.log("listening on port " + port);
});