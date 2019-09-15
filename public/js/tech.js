document.addEventListener("DOMContentLoaded",() => {
    const socket = io("/");

    socket.emit('requestTechData');
    socket.on("techUpdate",data => {
        document.querySelector("#targetTable").innerHTML = "";
        console.log("gotTechData");
        let nbr = 0;
        let newMap = new Map(JSON.parse(data));
        newMap.forEach((value ,key)=> {
            /*
            { temperature: 20.8,
                humidity: 63,
                full: 80,
                lat: 36.324,
                long: 7.09 ,
                defect:""
            }
            */
           if(value.defect != "non") {
               nbr++;
               document.querySelector("#targetTable").innerHTML += `<tr><th scope='row'>${"Collection sensor"}</th><td>${key}</td> <td>${"Waiting for pick up"}</td> <td>${value.defect}</td> <td>${"retrive"}</td> </tr>`
           }
        });
        document.querySelector("#Notif").innerHTML = nbr;
    });
});