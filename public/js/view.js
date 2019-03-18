document.addEventListener("DOMContentLoaded",() => {
    const socket = io("/");

    const positionOptions = {
        enableHighAccuracy : true,
        maxmumAge: 0
    };

    navigator.geolocation.getCurrentPosition(pos => {
        console.log(pos.coords);
        console.log(pos.coords.longitude);
        console.log(pos.coords.latitude);
    },err => {
    },positionOptions);


    const mymap = L.map('mapid').setView([51.505, -0.09], 13);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFybW91cmUiLCJhIjoiY2p0ZTJ1dzR2MTV4OTRhcWlhM2N4b3RodiJ9.cWMnhaBQo3gf_uL1A90eNA', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken:'pk.eyJ1IjoibWFybW91cmUiLCJhIjoiY2p0ZTJ1dzR2MTV4OTRhcWlhM2N4b3RodiJ9.cWMnhaBQo3gf_uL1A90eNA'
    }).addTo(mymap);
});

