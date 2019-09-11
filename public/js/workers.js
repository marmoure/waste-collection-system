document.addEventListener("DOMContentLoaded",() => {
    const socket = io("/");
    socket.emit('requestWorkersData');
    socket.on("workershUpdate",data => {
        document.querySelector("#targetTable").innerHTML = "";
        console.log("gotTechData");
        let workersData = JSON.parse(data);
        workersData.forEach((value)=> {
            console.log(value);
            // document.querySelector("#targetTable").innerHTML += `<tr><th scope='row'>${"Collection sensor"}</th><td>${key}</td> <td>${"Waiting for pick up"}</td> <td>${value.defect}</td> <td>${"retrive"}</td> </tr>`;
        });
    });
});