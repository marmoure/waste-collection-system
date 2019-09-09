"use strcit";
//server part
const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const router= express.Router();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);
const usersData = [];
let trigger = () => {};


//mqtt
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


//mqttfunction
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
                      long:  7.26024,
                      defect:"non"
                    });
client.on('message', (topic, message) => {
    if(topic.toString() === "update") {
        const payload = message.toString();
        const {id , data} = JSON.parse(payload);
        map.set(id,
            { temperature: data.temperature,
              humidity: data.humidity,
              full: data.full,
              lat: data.lat,
              long: data.long,
              defect:data.defect
            });
        console.log(map.size);
        trigger();
    }
});
//mqttfunction

//mqtt
// database

const mysql = require('mysql');
const con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database:"work"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DATABASE Connected!");
});



//   con.query(`INSERT INTO users (id, username, pass, usesrtype, reg_date) VALUES (NULL, '${name}', '${pass}', '${userType}', CURRENT_TIMESTAMP)`, function (error, results, fields) {
//     if (error) throw error;
//     console.log(results);
//   });
//   con.query(`SELECT * FROM users`, function (error, results, fields) {
//     if (error) throw error;
//     console.log(results);
//   });
//   con.end();

// database

//express server
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/haja",(req,res) => {
    const {name,password} = req.body;
   checkCredentials(name,password,res);
});

app.post("/add",(req,res) => {
    console.log(req.body);
    //TODO add data to database
});

server.listen(3000, err => {
 if(err){
        throw err;
    }
    console.log("server running on port 3000");
});
//experss server


//socketio
io.on("connection", socket => {
    socket.on("_ping", () => {
        socket.emit("_pong");
    });
    socket.on("requestMapData", () => {
        let transitString = JSON.stringify(Array.from(map));
        console.log("requestMapData")
        socket.emit("mapUpdate",transitString);
    });
    socket.on("requestTechData", () => {
        let transitString = JSON.stringify(Array.from(map));
        console.log("requestTechData")
        socket.emit("techUpdate",transitString);
    });
    socket.on("requestAdminData", () => {
        let transitString = JSON.stringify(Array.from(map));
        socket.emit("adminUpdate",transitString);
    });
    trigger= () => {
        let transitString = JSON.stringify(Array.from(map));
        socket.emit("mapUpdate",transitString);
        socket.emit("techUpdate",transitString);
        socket.emit("adminUpdate",transitString);
    };
});
//socketio



// my functions
const checkCredentials = (name,pass,res) => {
    //TODO use database
    let mytype = 0;
    con.query(`SELECT * FROM users WHERE username = "${name}"`, function (error, results, fields) {
        if (error) {
            mytype = 0;
            console.log("EROOOR in query");
        }else {
            let mypass = results[0].pass;
            console.log(mypass);
            if (mypass == pass) {
                mytype=results[0].usesrtype ;
                redirectUser(mytype,res);
            }
        }
    });
};


const redirectUser = (type,res) => {
    if( type != 0) {
        console.log(type);
        if(type == 3)
            res.redirect(200,'/view.html');
        if(type == 2)
            res.redirect(200,'/tech.html');
        if(type == 1)
            res.redirect(200,'/admin.html');
    }else {
        res.redirect(401, '/');
    }
}

// {"id":"arduino","data":{"temperature":20.80,"humidity":63.00,"full":15.00,"lat":36.084032,"long":7.26024}}
