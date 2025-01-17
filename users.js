const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const uuid = require("uuid");
const ReadAndWrite = require("read-and-write").ReadAndWrite;
const fileReader = new ReadAndWrite("./users.txt");
let users = fileReader.readAllRecordsSync();
let port = process.env.PORT || 8080;

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
    if (
        req.body["user-name"] === "" || req.body["first-name"] === "" ||
        req.body["last-name"] === "" || req.body["email-address"] === "" ||
        req.body["age"] === ""
    ) {
        res.render("error", {message: "Inputs cannot be blank"});
    } else if (req.body["age"] <= 0) {
        res.render("error", {message: "Age has to be greater than 0"});
    } else {
        const d = new Date();
        const user = {
            username: req.body["user-name"],
            firstName: req.body["first-name"],
            lastName: req.body["last-name"],
            email: req.body["email-address"],
            age: req.body["age"],
            userId: uuid.v4(),
            timeCreated: d.toLocaleString()
        };
        fileReader.appendRecords([user], () => {
            console.log("Appended users successfully");
        });
        users.push(user);
        res.redirect("/userList");
    }
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/userList", (req, res) => {
    res.render("usersList", {users});
});

app.get("/deleteUser/:userId", (req, res) => {
    fileReader.deleteRecord({
        key: "userId",
        value: req.params.userId
    }, refactoredUsers => {
        console.log("User deleted successfully");
        users = refactoredUsers;
    });
    res.redirect("/userList");
});

app.get("/userList/:userId", (req, res) => {
    const user = users.filter(user => user.userId === req.params.userId)[0];
    if (user) {
        res.render("editUser", {user});
    } else {
        res.render("error", {message: "That user does not exist"});
    }
});

app.post("/userList/:userId", (req, res) => {
    if (
        req.body["user-name"] === "" || req.body["first-name"] === "" ||
        req.body["last-name"] === "" || req.body["email-address"] === "" ||
        req.body["age"] === ""
    ) {
        res.render("error", {message: "Inputs cannot be blank"});
    } else if (req.body["age"] <= 0) {
        res.render("error", {message: "Age has to be greater than 0"});
    } else {
        fileReader.editRecord({
            key: "userId",
            value: req.params.userId
        }, [
            {
                key: "username",
                value: req.body["user-name"]
            }, {
                key: "firstName",
                value: req.body["first-name"]
            }, {
                key: "lastName",
                value: req.body["last-name"]
            }, {
                key: "email",
                value: req.body["email-address"]
            }, {
                key: "age",
                value: req.body["age"]
            }
        ], refactoredUsers => {
            console.log("User edited successfully");
            users = refactoredUsers;
        });
        res.redirect("/userList");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});