const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const UserController = require('./controller/UserController');
const ProjectController = require('./controller/ProjectController');


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

const addProjectPath = path.join(__dirname,"public_html", "addProject.html")

app.get("/", (req, res) => res.sendFile(testPath));
app.get("/addProject", (req, res) => res.sendFile(addProjectPath));

//User routes
app.post('/registeruser', UserController.register);

app.get('/users', UserController.getAllUsers);

app.delete('/deleteuser/:id', UserController.deleteUser);

app.put('/updaterole/:id', UserController.updateRole);

//Project routes
app.post('/projects', ProjectController.createProject);

app.get('/projects', ProjectController.getAllProjects);

app.get('/projects/:id', ProjectController.getProjectById);

app.put('/projects/:id', ProjectController.updateProject);

app.delete('/projects/:id', ProjectController.deleteProject);


module.exports = app;
