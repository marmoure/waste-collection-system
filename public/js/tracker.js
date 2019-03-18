document.addEventListener("DOMContentLoaded",() => {
    const socket = io('/');

    const positionOptions = {
        enableHighAccuracy : true,
        maxmumAge: 0
    };

    navigator.geolocation.getCurrentPosition(pos => {
        console.log(pos.coords);
    },err => {
    },positionOptions);

    socket.emit("_ping");
    socket.on("_pong", () => {
        console.log("ponngngngn");
    });
});
