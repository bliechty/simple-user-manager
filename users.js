const express = require("express");
const csv = require("csv-parser");
const createObjectCsvWriter = require("csv-writer").createObjectCsvWriter;
const session = require("express-session");
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();
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
        "firstName",
        "lastName",
        "email",
        "timeStamp"
    ],
    append: true
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} for ${req.url}`);
    next();
});

app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10000 }
}));

app.use("/createUser", express.static("./createUser"));
app.use("/searchUsers", express.static("./searchUsers"));
app.use("/sessionUsers", (req, res, next) => {
    if (!req.session.numSessionUsers) {
        res.end("There are no users created in this session");
    } else {
        res.end(`There are ${req.session.numSessionUsers} users created in this session`);
    }
});

app.post("/createUser", (req, res, next) => {
    const d = new Date();
    const firstName = req.body["first-name"];
    const user = {
        firstName,
        lastName: req.body["last-name"],
        email: req.body["email-address"],
        timeStamp: d.toLocaleString()
    };
    users.push(user);
    csvWriter.writeRecords([user]).then(() => {
        console.log("User written to csv file");
    });
    if (!req.session.numSessionUsers) {
        req.session.numSessionUsers = 1;
    } else {
        req.session.numSessionUsers++;
    }
    res.send(`<div>Thank you for making an account ${firstName}</div>`);
});

app.post("/searchUsers", (req, res) => {
    const user = users.filter(userObj => userObj.email === req.body["email-address"])[0];
    if (user) {
        res.send(`<div>First Name: ${user.firstName} LastName: ${user.lastName}</div>`);
    } else {
        res.send("user not found");
    }
});

app.get("/allUsers", (req, res) => {
    for (let user of users) {
        res.write(`First Name: ${user.firstName}\n`);
        res.write(`Last Name: ${user.lastName}\n`);
        res.write(`Email: ${user.email}\n`);
        res.write(`Account created: ${user.timeStamp}\n\n\n`);
    }
    res.end("End of user list");
});

app.use((err, req, res) => {
    console.log("Error");
    res.status(500).send("Something broke");
});

app.listen(port, () => {
    console.log("listening on port 8080");
});