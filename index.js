"use strcit";

const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

const mqtt = require('mqtt');



const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res) => {
    res.send();
});
io.on("connection", socket => {
    socket.on("_ping", () => {
        console.log("pinnng");
        socket.emit("_pong");
    });
});
server.listen(3000, err => {
   
const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

const mqtt = require('mqtt');

 if(err){
        throw err;
    }
    console.log("server running on port 3000");
});


const options = {
    protocolId: 'MQTT', // Or 'MQIsdp' in MQTT 3.1 and 5.0
    protocolVersion: 4, // Or 3 in MQTT 3.1, or 5 in MQTT 5.0
    clean: false, // Can also be false
    clientId: "nodeserver1",
    username: "fchlyhyo",
    password: "88Y3R_KV7BMT"
};

const client  = mqtt.connect('tcp://m16.cloudmqtt.com:15142',options);

let map = new Map();

client.on('connect',  () => {
    client.subscribe('here',(err) => {
      if (!err) {
        //client.publish('alive', "who's there");
      }
    });
});
client.on('message', (topic, message) => {
    if(topic.toString() === "here") {
        const device = message.toString();
        client.subscribe(device);
        map.set(device,{
            temp:20,
            humid:50
        });
        console.log(device);
        console.log(map)
    }
});

setInterval(() => {
    client.publish('alive', "who's there");
},7000);