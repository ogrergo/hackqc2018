var map = L.map('mapid').setView([45.5, -73.8], 18);

var street = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets',
  accessToken: 'pk.eyJ1Ijoib2dyZWJ1cmRlbiIsImEiOiJjamdyYmdyaXMwMzBsMzJueDlwdjBjZXlpIn0.Rar0bZ870hpisFVD7XwRQw'
})

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

googleSat.addTo(map)
street.addTo(map);


var ilos = L.tileLayer.wms("https://geoegl.msp.gouv.qc.ca/ws/igo_gouvouvert.fcgi", {
    layers: 'inspq_ilot_chaleur',
    format: 'image/png',
    transparent: true,
    attribution: "Ilôts de chaleur © Données Quebec",
		opacity: 0.6
})


var baseMaps = {
    "Satelite": googleSat,
    "Street": street
};

var heatmap = {
	'Ilôts de chaleurs': ilos
}
L.control.layers(baseMaps, heatmap).addTo(map);

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

let tree_layer = null

var models = require('./models.js')
const popups = require('./popup.js')

var proposal_icons = []
for (var i = 0; i <4; i++) {
	proposal_icons.push(L.icon({
	    iconUrl: `data/img/plant-pot${i}0.png`,
	    shadowUrl:  `data/img/plant-pot${i}1.png`,

	    iconSize:     [100, 100], // size of the icon
	    shadowSize:   [100, 100], // size of the shadow
	    iconAnchor:   [50, 50], // point of the icon which will correspond to marker's location
	    shadowAnchor: [50, 50],  // the same for the shadow
	    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
	}));
}

// map.on('click', e=> {
// 	var latlng = e.latlng
// 	// L.marker(latlng, {icon: proposal_icons[3],
// 	// 									color: '#33ee44',
// 	// 									transparency: 0.6
// 	// 								}).addTo(map)
//
// 	var popup = L.popup()
// 		.setLatLng(latlng)
// 		.setContent(popups.build_missing_tree(map))
//     .openOn(map);
//
// })
var proposal_layer;
map.on('moveend', e => {
	var bbox = map.getBounds()
	var zoom = map.getZoom()

	if (zoom < 16) {
		if (tree_layer)
			tree_layer.clearLayers()
	} else
		models.get_trees_geojson(bbox).then(data => {

		if (tree_layer)
			tree_layer.clearLayers()

		tree_layer = L.geoJSON(data, {pointToLayer:  (feature, latlng) => {
		        return 	L.marker(latlng, {icon: proposal_icons[3],
																color: '#33ee44',
																transparency: 0.6
															})
		    }})
				tree_layer = L.geoJSON(data, {pointToLayer:  (feature, latlng) => {
								return L.circleMarker(latlng, geojsonMarkerOptions);
						}})

		tree_layer.bindPopup(layer => popups.build_tree(map, layer))
		tree_layer.addTo(map)
	}).catch(console.error);

	models.get_trees_proposal(bbox).then(data => {
		if(proposal_layer)
			proposal_layer.clearLayers()

		proposal_layer = L.geoJSON(data, {pointToLayer:  (feature, latlng) => {
						var score = feature.properties.up_votes;
						var i = 0
						if (score > 6)
							i = 3
						else if (score > 4)
							i = 2
						else if (score > 2)
							i = 1

						// feature.properties.
						return 	L.marker(latlng, {icon: proposal_icons[i],
																color: '#33ee44',
																transparency: 0.6
															})
				}})
		proposal_layer.bindPopup(function (layer) {
		    return popups.build_vote_popup(map, layer.feature.properties.id, layer.feature.properties.up_votes)
		})
		proposal_layer.addTo(map)

	})


})

map.panTo(new L.LatLng(45.517711,-73.5966052));

const geocoder = require("geocoder/providers/google")
var address_pin = null;
document.getElementById('address').onchange = e => {
	var adress = e.target.value
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
				address_pin = L.marker(coord, {icon: greenIcon}).addTo(map)
			}
	}, {key: constants.API_GOOGLE_KEYS});
}
// L.control.mousePosition(
// L.control.mousePosition().addTo(map);
