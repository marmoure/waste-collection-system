document.addEventListener("DOMContentLoaded",() => {
    console.log("hello there");
    const socket = io("/");
    socket.emit('requestWorkersData');
    socket.on("workersUpdate",data => {
        document.querySelector("#targetTable").innerHTML = "";
        console.log("gotTechData");
        let workersData = JSON.parse(data);
        workersData.forEach((value)=> {
            // id: 1
// last_login: "2019-09-10T13:37:07.000Z"
// pass: "admin"
// reg_date: "2019-09-10T13:37:07.000Z"
// username: "admin"
// usertype: 1
let id = value.id;
            let name = value.username;
            let pass = value.pass;
            let type = value.usertype;
            let last_login = value.last_login;
            let usertype = "";
            if(type == 1) usertype = "Admin";
            if(type == 2) usertype = "Technician";
            if(type == 3) usertype = "Collector";
        //     <tr>
        //   <th scope="row">collector </th>
        //   <td>893223</td> 
        //   <td>Active</td> 
        //   <td>2019-09-10T13:37:07</td> 
        // </tr>
        let active = "";
        let act = Math.random();
        act *= 10;
        (act %2 == 0)?(active = "Active"):(active="Not active"); 
        if(id == 1) active = "Active";
            document.querySelector("#targetTable").innerHTML += `<tr><th scope='row'>${usertype}</th><td>${id}</td> <td>${name}</td><td>${active}</td> <td>${last_login}</td> </tr>`;
        });
    });
});