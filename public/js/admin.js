document.addEventListener("DOMContentLoaded",() => {
    let size = 0;
    let total = 0;
    let percent = 0;
    const socket = io("/");
    socket.emit('requestAdminData');
    socket.on("adminUpdate",data => {
        let newMap = new Map(JSON.parse(data));
        size = newMap.size;
        newMap.forEach(value => {
            total +=value.full;
            console.log(value.full);
        });
        ( size === 0 )? (percent = 0): (percent = total /size);
        percent = percent.toFixed(0);
         document.querySelector("#resume").innerHTML = `Daily Progress ${percent}%`;
         document.querySelector("#progress-bar").style.width = `${percent}%`;
    });
    socket.emit('requestWorkersData');
    socket.on("workersUpdate",data => {
        let workersData = JSON.parse(data);
        let admins = 0;
        let tech = 0;
        let collec = 0;
        workersData.forEach((value)=> {
            if(value.usertype == 1) admins++;
            if(value.usertype == 2) tech++;
            if(value.usertype == 3) collec++;
            console.log(value.id);
        });
        document.querySelector("#worker").innerHTML = tech+collec;
        document.querySelector("#colec").innerHTML = tech;
        document.querySelector("#tech").innerHTML = collec;
    });
});