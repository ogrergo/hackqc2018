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

let tree_layer = null
// trees, {
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     }
// })
// tree_layer.setStyle({ color: "#22ff44",weight: 0.5,opacity: 1,})
// tree_layer.bindPopup(function (layer) {
//     return layer.feature.properties.type;
// })
// tree_layer.addTo(map);

var models = require('./models.js')

// map.on('zoomend', e=> {
//
// })
var greenIcon = L.icon({
    iconUrl: 'data/img/plant-pot0.svg',
    shadowUrl:  'data/img/plant-pot0.svg',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [19, 95], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

map.on('click', e=> {
	var latlng = e.latlng
  //
	// `<div  style="display: flex; flex-direction: column; justify-content: center;">
	// 	<p>Choose the new tree essence :</p>
	// 	<select></select>
	// </div>`
	// var domelem = document.createElement('selectg');
	// domelem.innerHTML = "Click me";
	// domelem.onclick = function() {
	//     alert(this.href);
	//     // do whatever else you want to do - open accordion etc
	// };

	var popup = L.popup()
    .setLatLng(latlng)
    .setContent(['lat', 'lng'].map(e=>latlng[e]).join(', '))
    .openOn(map);

	// models.plant_tree_at(latlon)
})
map.on('moveend', e => {
	var bbox = map.getBounds()
	var zoom = map.getZoom()

	if (zoom < 16) {
		if (tree_layer)
			tree_layer.clearLayers()
		return
	}

	models.get_trees_geojson(bbox).then(data => {
		if (tree_layer)
			tree_layer.clearLayers()

		tree_layer = L.geoJSON(data, {pointToLayer:  (feature, latlng) => {
		        return L.circleMarker(latlng, geojsonMarkerOptions);
		    }})
		tree_layer.bindPopup(function (layer) {
		    return `
					<div>
						<div style="display: flex; flex-direction: row; justify-content: center;">
							<i class="fa fa-tree fa-2x"></i>
							<p style="margin: 10px;">${layer.feature.properties.tree_name_fr}</p>
						</div>
						<p>${layer.feature.properties.arrond_name}</p>
						<p>${['lat', 'lon'].map((e, i)=>e + ':' +layer.feature.geometry.coordinates[i]).join(', ')}</p>

						<button>Vote for this tree</button>
					</div>`
		})
		tree_layer.addTo(map)
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
				address_pin = L.marker(coord, {icon: greenIcon}).addTo(map)
			}
	}, {key: constants.API_GOOGLE_KEYS});
}
// L.control.mousePosition(
// L.control.mousePosition().addTo(map);
