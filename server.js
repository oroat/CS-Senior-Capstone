require("dotenv").config();

const dbConnect = require("./dbconnection.js");
const app = require("./app.js");

const http = require("http");
const { Server } = require("socket.io");


dbConnect.connect();

const server = http.createServer(app);

server.listen(process.env.PORT, process.env.HOSTNAME, () => {
    console.log(`Server Running on ${process.env.HOSTNAME}:${process.env.PORT}...`);
});
