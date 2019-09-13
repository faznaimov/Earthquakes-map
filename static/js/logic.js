const API_KEY = "pk.eyJ1IjoiZmF6bGlkZGluIiwiYSI6ImNqejkwZTE2ejAwYzgzbXA1cHp4a3g3aGYifQ.lg4_5EsumuwP0Xso1dM-Gg";

var URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(URL, function (data) {
    createFeatures(data.features)
});

function chooseColor(d) {
    return d > 6  ? '#581845' :
           d > 5  ? '#900C3F' :
           d > 4  ? '#C70039' :
           d > 3   ? '#FF5733' :
           d > 2   ? '#FFC300' :
           d > 1   ? '#BAFF2F' :
                    '#4FFF2F';
};

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        var months = ['Jan','Feb','Mar','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        var days = ['Sun','Mon','Tues','Wed','Thu','Fri','Sat']
        var timestamp = new Date(feature.properties.time);
        var day = days[timestamp.getDay()];
        var month = months[timestamp.getMonth()];
        var date = timestamp.getDate();
        var hours = timestamp.getHours();
        var minutes = "0" + timestamp.getMinutes();
        var formattedTime = day + ", " + month + " " + date + " " + hours + ':' + minutes.substr(-2);
        
        layer.bindPopup(`<strong>Location: ${feature.properties.place}</strong>
            <hr>
            Magnitude: ${feature.properties.mag}
            <br>
            Time: ${formattedTime}`);
    };

    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: Math.pow(2,feature.properties.mag),
                fillColor: chooseColor(feature.properties.mag),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: onEachFeature
    });
    createMap(earthquakes);
};

function createMap(earthquakes) {
    
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });
    
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var physicalmap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}.png?access_token={accessToken}"', {
	    attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
        maxZoom: 18,
        id: "mapbox.physical",
        accessToken: API_KEY
});
    
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Physical Map": physicalmap
    };
    
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };
    
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });
    
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6],
            labels = [];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
};
