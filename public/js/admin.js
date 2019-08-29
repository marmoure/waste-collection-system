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
});