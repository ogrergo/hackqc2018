const constants = require('./constants.js')

module.exports = (()=>{
  function formatParams( params ){
    return "?" + Object
          .keys(params)
          .map(function(key){
            return key+"="+encodeURIComponent(params[key])
          })
          .join("&")
  }

  function request(url, verb, data) {
    return new Promise((accept, reject) => {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function(e) {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
          var myArr = JSON.parse(this.responseText);
          accept(myArr)
        }
        // else if (this.readyState == XMLHttpRequest.DONE && this.status != 200)
          // reject(e)
      }

      if (verb == 'GET' && data) {
          url = url + formatParams(data)
          data = null
      }
      xmlhttp.open(verb, url, true);
      if (verb == 'POST') {
        xmlhttp.setRequestHeader("Content-type", "application/json");
        data = JSON.stringify(data)
      }
      console.log('request send ' + verb + ':' + url+ ' ' + data)
      xmlhttp.send(data);
    })
  }

  return {
    get: (url, data) => request(url, 'GET', data),
    post: (url, data) => request(url, 'POST', data),
    put: (url, data) => request(url, 'PUT', data),
    delete: (url, data) => request(url, 'DELETE', data),
    get_trees_geojson: bbox => request(constants.SERVER_URL + 'trees', 'GET',
      {'latlon_sw': [bbox._southWest.lat,bbox._southWest.lng],
       'latlon_ne': [bbox._northEast.lat,bbox._northEast.lng]}),
    get_trees_proposal: bbox => request(constants.SERVER_URL + 'tree_proposals', 'GET',
      {'latlon_sw': [bbox._southWest.lat,bbox._southWest.lng],
       'latlon_ne': [bbox._northEast.lat,bbox._northEast.lng]}),
    plant_tree: (latlon, essence) => request(constants.SERVER_URL  + 'trees', 'POST',
      {
        'latlon': [latlon.lat, latlon.lng].join(','),
        'name_fr': essence,
        'name_en': essence,
        'name_latin': essence
      }),
    vote_tree: id => request(constants.SERVER_URL  + 'upvote/' + id, 'PUT')
  }

})()
