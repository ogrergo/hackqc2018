const models = require('./models.js')

module.exports = (()=>{

  function build_missing_tree(map) {
    return     `
          <div>
            <button>Report missing tree</button>
          </div>`
  }
  function build_tree(map, layer) {
    return     `
          <div>
            <div style="display: flex; flex-direction: row; justify-content: center;">
              <i class="fa fa-tree fa-2x"></i>
              <p style="margin: 10px;">${layer.feature.properties.tree_name_fr}</p>
            </div>
            <p>${layer.feature.properties.arrond_name}</p>
            <p>${['lat', 'lon'].map((e, i)=>e + ':' +layer.feature.geometry.coordinates[i]).join(', ')}</p>

            <button>Report invalid tree</button>
          </div>`
  }

  function build_vote_popup(map, id, votes) {
    var container = document.createElement('div');
    container.style = "display: flex; flex-direction: column; justify-content: center;"

    var p = document.createElement('h3');
    p.innerHTML = 'This is a seed, vote if you want to see a tree here !'
    container.appendChild(p)

    var p2 = document.createElement('p');
    p2.innerHTML = `Current votes: ${votes}`
    container.appendChild(p2)

    var button_for = document.createElement('button')
    button_for.innerHTML = 'Vote for this tree'
    button_for.style = "margin: 10px;"

    var info = document.createElement('span')

    var email = document.createElement('input')
    email.type = 'email'
    email.placeholder = 'Write your email to follow this tree'

    info.appendChild(email)

    // var button_against = document.createElement('button')
    // button_against.innerHTML = 'Vote against this tree'
    // button_against.style = "margin: 10px;"

    // container.appendChild(select)
    container.appendChild(button_for)
    container.appendChild(info)
    // container.appendChild(button_against)

    button_for.onclick = function(e) {
      models.vote_tree(id).then(() => map.fire('moveend'))
      // var essence = select.options[select.selectedIndex].value
      // models.plant_tree(latlng, essence).then(data => {
      //
      // 	map.fire('moveend')
      // })

    };
    return container
  }


  return {
    build_vote_popup:build_vote_popup,
    build_missing_tree: build_missing_tree,
    build_tree:build_tree
        }
})()
