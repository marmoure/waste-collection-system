document.addEventListener("DOMContentLoaded",() => {
    const socket = io("/");
    socket.emit('requestData');
    const positionOptions = {
        enableHighAccuracy : true,
        maxmumAge: 0
    };

    let lgt = 7.260075;
    let lat = 36.083138;

    const mymap = L.map('content').setView([lat, lgt], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoibWFybW91cmUiLCJhIjoiY2p0ZTJ1dzR2MTV4OTRhcWlhM2N4b3RodiJ9.cWMnhaBQo3gf_uL1A90eNA'
        }).addTo(mymap);
    //L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFybW91cmUiLCJhIjoiY2p0ZTJ1dzR2MTV4OTRhcWlhM2N4b3RodiJ9.cWMnhaBQo3gf_uL1A90eNA', ).addTo(mymap);

    
    let popup = L.popup();
    function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
    }

    mymap.on('click', onMapClick);

    let greenIcon = L.icon({
        iconUrl: 'icon/trash.png',
        shadowUrl: '',
        iconSize:     [15, 40], // size of the icon
        shadowSize:   [10, 20], // size of the shadow
        iconAnchor:   [5, 10], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 4],  // the same for the shadow
        popupAnchor:  [-3, -10] // point from which the popup should open relative to the iconAnchor
    });
    let redIcon = L.icon({
        iconUrl: 'icon/trash.png',
        shadowUrl: '',
        iconSize:     [15, 40], // size of the icon
        shadowSize:   [10, 20], // size of the shadow
        iconAnchor:   [5, 10], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 4],  // the same for the shadow
        popupAnchor:  [-3, -10] // point from which the popup should open relative to the iconAnchor
    });
    socket.on("mapUpdate",data => {
        let newMap = new Map(JSON.parse(data));
        newMap.forEach(value => {
            /*
            { temperature: 20.8,
                humidity: 63,
                full: 80,
                lat: 36.324,
                long: 7.09 
            }
            */
           
           let str = "Temp: "+value.temperature + " ℃ "+"Humidity: "+value.humidity+" % "+"full: "+value.full+" %";
            L.marker([value.lat, value.long], {icon: greenIcon}).addTo(mymap).bindPopup(str).openPopup();
        });
    });

});

