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
let sendWorkersData = () => {};

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
    const data = req.body;
    // console.log(data);
    //TODO add data to database
    checkData(data,res);
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
    socket.on("requestWorkersData", () => {
        console.log("requestMapData");
        getWorkersData();
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
    sendWorkersData = (data) => {
        let transitString = JSON.stringify(data);
        socket.emit("workersUpdate",transitString);
    };
});
//socketio

const getWorkersData = () => {
    con.query(`SELECT * FROM users`, function (error, results, fields) {
        if (error) throw error;
        sendWorkersData(results);
    });
};

// my functions
const checkCredentials = (name,pass,res) => {
    //TODO use database
    console.log("chechiknggg");
    let mytype = 0;
    con.query(`SELECT * FROM users WHERE username = "${name}"`, function (error, results, fields) {
        if (error) {
            mytype = 0;
            console.log("EROOOR in query");
        }else {
            if(results.length == 0) {
                console.log("gotnothing");
                redirectUser(0,res);
            }else {
                let mypass = results[0].pass;
                if (mypass == pass) {
                    mytype=results[0].usertype;
                    redirectUser(mytype,res);
                }else {
                    redirectUser(0,res);
                }
            }
        }
    });
};


const redirectUser = (type,res) => {
    if( type != 0) {
        console.log("redirecting here",type);
        if(type == 3)
            res.redirect('/view.html');
        if(type == 2)
            res.redirect('/tech.html');
        if(type == 1)
            res.redirect('/admin.html');
    }else {
        res.redirect(401, '/');
    }
};

const checkData = (data,res) => {
    const {name,password,password2,admin,tech,collec} = data;
    console.log(name,password,password2,admin,tech,collec);
    con.query(`SELECT * FROM users WHERE username = "${name}"`, function (error, results, fields) {
        if (error) {
        }else {
            // console.log(results);
            if(results.length == 0) {
                addUser(data,res)
            }else {
                console.log("here on found user");
                res.redirect(406,'/register.html');
            }
        }
    });

};

const addUser = (data,res) => {
    const {name,password,password2,admin,tech,collec} = data;
    let usertype = 0;
    if(admin != undefined) usertype = 1;
    else if(tech != undefined) usertype = 2;
    else if(collec != undefined) usertype = 3;
    if(usertype == 0 || password != password2) {
        console.log("here on adduser");
        res.redirect(406,'/register.html');
    }   
    else {
        let query = `INSERT INTO users (id, username, pass, usertype, reg_date, last_login) VALUES (NULL, "${name}", "${password}", ${usertype}, current_timestamp(), current_timestamp())`
        console.log(query);
        con.query(query, function (error, results, fields) {
                if (error) throw error;
                console.log(results);
              });
        res.redirect(201,'/admin.html');
    }
};
// {"id":"arduino","data":{"temperature":20.80,"humidity":63.00,"full":15.00,"lat":36.084032,"long":7.26024}}
