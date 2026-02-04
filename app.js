const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const UserController = require('./controller/UserController');

const app = express();

/** 
const sessionM = session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
});
*/


//app.use(sessionM);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public_html")));

const testPath = path.join(__dirname, "public_html", "landing.html");

app.get("/", (req, res) => res.sendFile(testPath));

app.post('/registeruser', UserController.register);

app.get('/users', UserController.getAllUsers);


module.exports = app;
