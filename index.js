"use strcit";
//server part
const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res) => {
    res.send();
});

server.listen(3000, err => {


 if(err){
        throw err;
    }
    console.log("server running on port 3000");
});

const mqtt = require('mqtt');
const options = {
    protocolId: 'MQTT', // Or 'MQIsdp' in MQTT 3.1 and 5.0
    protocolVersion: 4, // Or 3 in MQTT 3.1, or 5 in MQTT 5.0
    clean: false, // Can also be false
    clientId: "nodeserver1",
    username: "fchlyhyo",
    password: "88Y3R_KV7BMT"
};
const client  = mqtt.connect('tcp://m16.cloudmqtt.com:15142',options);


client.on('connect',  () => {
    client.subscribe('here',(err) => {
      if (!err) {
        //client.publish('alive', "who's there");
      }
    });
    client.subscribe('update',(err) => {
        if (!err) {
          //client.publish('alive', "who's there");
        }
      });
});

let map = new Map();
map.set("arduino",
                    { temperature: 20.8,
                      humidity: 63,
                      full: 15,
                      lat: 36.084032,
                      long:  7.26024
                    });

client.on('message', (topic, message) => {
    if(topic.toString() === "update") {
        const payload = message.toString();
        const {id , data} = JSON.parse(payload);
        console.log(data);
        console.log(id);
        map.set(id,data);
        console.log(map);
    }
});

setInterval(() => {
    client.publish('alive', "who's there");
},7000);

io.on("connection", socket => {
    socket.on("_ping", () => {
        console.log("pinnng");
        socket.emit("_pong");
    });
    socket.on("requestData", () => {
        let transitString = JSON.stringify(Array.from(map));
        console.log(transitString)
        socket.emit("mapUpdate",transitString);
    });
});


// {"id":"arduino","data":{"temperature":20.80,"humidity":63.00,"full":15.00,"lat":36.084032,"long":7.26024}}
