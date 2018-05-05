var map = L.map('mapid').setView([45.5, -73.8], 18);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets',
  accessToken: 'pk.eyJ1Ijoib2dyZWJ1cmRlbiIsImEiOiJjamdyYmdyaXMwMzBsMzJueDlwdjBjZXlpIn0.Rar0bZ870hpisFVD7XwRQw'
}).addTo(map);

// var trees = require('./trees.js')
var geojsonMarkerOptions = {
    radius: 3,
    fillColor: "#22ff44",
    color: "#000",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.5
};
const constants = require('./constants')

let tree_layer = L.geoJSON()
// trees, {
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     }
// })
tree_layer.setStyle({ color: "#22ff44",weight: 0.5,opacity: 1,})
tree_layer.bindPopup(function (layer) {
    return layer.feature.properties.type;
})
tree_layer.addTo(map);

var models = require('./models.js')

map.on('moveend', e => {
	var bbox = map.getBounds()
	models.get_trees_geojson(bbox).then(data => {
		tree_layer.clearLayers()
		tree_layer.addData(data)
	}).catch(console.error);
})

map.panTo(new L.LatLng(45.517711,-73.5966052));

L.tileLayer.wms("https://geoegl.msp.gouv.qc.ca/ws/igo_gouvouvert.fcgi", {
    layers: 'inspq_ilot_chaleur',
    format: 'image/png',
    transparent: true,
    attribution: "Ilôts de chaleur © Données Quebec",
		opacity: 0.6
}).addTo(map)

var popup = L.popup()
    .setLatLng(new L.LatLng(45.517711,-73.5966052))
    .setContent(`
			<div>
			<h3> 332 persons already voted to plant this tree !</h3>
			<div style="display: flex; flex-direction: row; justify-content: center;">
				<i class="fa fa-tree fa-2x"></i>
				<p>Tree adress</p>
			</div>
			<p>What is the amount of money that can be saved</p>
			<button>Vote for this tree</button>
			</div>`)
    .openOn(map);


const geocoder = require("geocoder/providers/google")
var address_pin = null;
document.getElementById('address').onchange = e => {
	var adress = e.target.value
	console.log(adress);
	if (adress == '')
		return

	geocoder.geocode({}, adress, function ( err, data ) {
  	if (err) {
			alert(err);
		} else
			if (data.status != 'OK')
				alert("Address not found")
			else {
				if (address_pin != undefined) {
					map.removeLayer(address_pin);
				};

				let loc = data.results[0].geometry.location
				let coord = new L.LatLng(loc.lat, loc.lng)
				map.setView(coord, 17);
				address_pin = L.marker(coord).addTo(map)
			}
	}, {key: constants.API_GOOGLE_KEYS});
}
// L.control.mousePosition(
L.control.mousePosition().addTo(map);
