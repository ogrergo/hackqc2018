var map = L.map('mapid').setView([45.5, -73.8], 18);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets',
  accessToken: 'pk.eyJ1Ijoib2dyZWJ1cmRlbiIsImEiOiJjamdyYmdyaXMwMzBsMzJueDlwdjBjZXlpIn0.Rar0bZ870hpisFVD7XwRQw'
}).addTo(map);

var trees = require('./trees.js')
var geojsonMarkerOptions = {
    radius: 3,
    fillColor: "#22ff44",
    color: "#000",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.5
};

console.log(trees)
L.geoJSON(trees,{
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).bindPopup(function (layer) {
    return layer.feature.properties.type;
}).addTo(map);

map.panTo(new L.LatLng(45.517711,-73.5966052));
// L.control.mousePosition().addTo(map);
