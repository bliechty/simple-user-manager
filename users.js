const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const path = require("path");
const uuid = require("uuid");
let users = [];
let port = process.env.PORT || 8080;

fs.readFile("./users.txt", "utf-8", (err, content) => {
    if (err) {
        console.log(`Error: ${err}`);
    } else {
        let tempUsers = content.split("\n");
        tempUsers = tempUsers.slice(0, tempUsers.length - 1);
        for (let user of tempUsers) {
            users.push(JSON.parse(user));
        }
    }
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
        users.push(user);
        fs.appendFile("./users.txt", `${JSON.stringify(user)}\n`, err => {
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                console.log("User was appended to file");
            }
        });
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
    let refactoredUsers = "";
    users = users.filter(user => {
        if (user.userId !== req.params.userId) {
            refactoredUsers += `${JSON.stringify(user)}\n`;
        }
        return user.userId !== req.params.userId
    });
    fs.writeFile("users.txt", refactoredUsers, err => {
        if (err) {
            console.log(`Error: ${err}`);
        } else {
            console.log("Users written to file");
        }
    });
    res.redirect("/userList");
});

app.get("/userList/:userId", (req, res) => {
    const user = users.filter(user => user.userId === req.params.userId)[0];
    if (user) {
        res.render("editUser", {user});
    } else {
        res.send("That user does not exist");
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
        let refactoredUsers = "";
        users = users.map(user => {
            if (user.userId === req.params.userId) {
                const refactoredUser = {
                    ...user,
                    username: req.body["user-name"],
                    firstName: req.body["first-name"],
                    lastName: req.body["last-name"],
                    email: req.body["email-address"],
                    age: req.body["age"]
                };
                refactoredUsers += `${JSON.stringify(refactoredUser)}\n`;
                return refactoredUser;
            } else {
                refactoredUsers += `${JSON.stringify(user)}\n`;
                return user;
            }
        });
        fs.writeFile("users.txt", refactoredUsers, err => {
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                console.log("Users written to file");
            }
        });
        res.redirect("/userList");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});