const constants = require('./constants.js')

module.exports = (()=>{
  function request(url, verb, data) {
    return new Promise((accept, reject) => {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var myArr = JSON.parse(this.responseText);
          accept(myArr)
        } else {
          reject(this)
        }
      }

      xmlhttp.open(verb, url, true);
      xmlhttp.send(data);
    })
  }

  return {
    get: (url, data) => request(url, 'GET', data),
    post: (url, data) => request(url, 'POST', data),
    put: (url, data) => request(url, 'PUT', data),
    delete: (url, data) => request(url, 'DELETE', data),
    get_trees_geojson: bbox => request(constants.SERVER_URL_TREES, 'GET', {'latlon_sw': bbox._southWest, 'latlon_ne': bbox._northEast})
  }

})()
