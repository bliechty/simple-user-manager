const express = require("express");
const csv = require("csv-parser");
const createObjectCsvWriter = require("csv-writer").createObjectCsvWriter;
const session = require("express-session");
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();
const path = require("path");
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

app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 100000 }
}));

app.get("/createUser", (req, res) => {
    res.render("index");
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
        timeCreated: d.toLocaleString()
    };
    users.push(user);
    csvWriter.writeRecords([user]).then(() => {
        console.log("User written to csv file");
    });
    res.send(`<div>Thank you for making an account ${firstName}</div>
              <a href="/createUser">Create User</a>`);
});

app.get("/", (req, res) => {
    res.send("Home Page");
});

app.get("/allUsers", (req, res) => {
    for (let user of users) {
        res.write(`Username: ${user.username}\n`);
        res.write(`First Name: ${user.firstName}\n`);
        res.write(`Last Name: ${user.lastName}\n`);
        res.write(`Email: ${user.email}\n`);
        res.write(`Age: ${user.age}\n`);
        res.write(`Account created: ${user.timeCreated}\n\n\n`);
    }
    res.end("End of user list");
});

app.listen(port, () => {
    console.log("listening on port " + port);
});