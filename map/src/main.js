var map = L.map('mapid').setView([45.5, -73.8], 12);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets',
  accessToken: 'pk.eyJ1Ijoib2dyZWJ1cmRlbiIsImEiOiJjamdyYmdyaXMwMzBsMzJueDlwdjBjZXlpIn0.Rar0bZ870hpisFVD7XwRQw'
}).addTo(map);

var data = require('./data.js');

L.geoJSON(data.parcs,  {
    style: function (feature) {
        return {color: '#33aaff'};
    }
}).bindPopup(function (layer) {
    return layer.feature.properties.Nom_parc;
}).addTo(map);

const colors = {'Mineure': '#882211', 'Modérée': '#aa2211', 'Majeure': '#ee3322'}

L.geoJSON(data.vague_de_chaleur,  {
    style: function (feature) {
        return {color: colors[feature.properties.VULN_CAT]};
    }
}).bindPopup(function (layer) {
    return layer.feature.properties.NOM_ARR;
}).addTo(map);
