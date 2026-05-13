const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const memorystore = require("memorystore")(session);

const UserController = require('./controller/UserController');
const ProjectController = require('./controller/ProjectController');
const ToolController = require('./controller/ToolController');
const PurchaseOrderController = require('./controller/PurchaseOrderController');
const ShipmentController = require('./controller/ShipmentController');


const app = express();

app.use(session({
    secret: 'Pineapple - Guava - Orange',
    cookie: {maxAge: 86400000 }, // = 1000*60*60*24 = 24Hours
    store: new memorystore({ checkPeriod:86400000 }),
    resave: false,
    saveUninitialized: true
  }));

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

const purchaseOrderPath = path.join(__dirname,"public_html","purchaseOrders.html")

const shipmentPath = path.join(__dirname,"public_html","shipments.html")



app.get("/", (req, res) => res.sendFile(testPath));
app.get("/addProject", (req, res) => res.sendFile(addProjectPath));
app.get("/purchaseOrder", (req, res) => res.sendFile(purchaseOrderPath));
app.get("/shipment", (req, res) => res.sendFile(shipmentPath));

//User routes
app.post('/registeruser', UserController.register);

app.get('/users/:id', UserController.getUserById);

app.get('/users', UserController.getAllUsers);

app.delete('/deleteuser/:id', UserController.deleteUser);

app.put('/updaterole', UserController.updateRole);

app.post('/login', UserController.login);
app.get('/logout', UserController.logout);
app.get('/logged', UserController.logged);

//Project routes
app.post('/projects', ProjectController.createProject);

app.get('/projects', ProjectController.getAllProjects);

app.get('/projects/:id', ProjectController.getProjectById);

app.put('/projects/:id', ProjectController.updateProject);

app.delete('/projects/:id', ProjectController.deleteProject);

//Tool routes
app.post('/createtool', ToolController.create);

app.get('/tools', ToolController.getAllTools);

app.delete('/deletetool/:id', ToolController.deleteTool);

app.post('/updatetool', ToolController.update);

//app.get('/tools/:serial', ToolController.getToolBySerial);

app.get('/tools/:id', ToolController.getToolById);

//Materials routes
app.get('/purchaseorders', PurchaseOrderController.getAllPurchaseOrders);
app.get('/purchaseorders/:id', PurchaseOrderController.getPurchaseOrderById);
app.post('/purchaseorders', PurchaseOrderController.createPurchaseOrder);
app.put('/purchaseorders/:id', PurchaseOrderController.updatePurchaseOrder);
app.delete('/purchaseorders/:id', PurchaseOrderController.deletePurchaseOrder);

//Shipments routes
app.post('/shipments', ShipmentController.createShipment);

app.get('/shipments', ShipmentController.getAllShipments);

app.get('/shipments/:id', ShipmentController.getShipmentById);

app.put('/shipments/:id', ShipmentController.updateShipment);

app.delete('/shipments/:id', ShipmentController.deleteShipment);


module.exports = app;
