from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo
from bson import ObjectId
from geojson import Feature, Point, FeatureCollection, dumps
from utils.entry_status import EntryStatus


app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'hackqc-2018'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/hackqc-2018'

mongo = PyMongo(app)

@app.route('/trees', methods=['GET'])
def get_all_trees():
  trees = mongo.db.trees
  lat_long_sw = request.args.get('latlon_sw')
  lat_long_ne = request.args.get('latlon_ne')
  lat_sw, long_sw = [float(i) for i in lat_long_sw.split(',')]
  lat_ne, long_ne = [float(i) for i in lat_long_ne.split(',')]

  selected_trees = trees.find({'loc': {'$geoWithin': {
      '$box': [
          [long_ne, lat_ne],
          [long_sw, lat_sw]
      ]
  }}})

  output = []

  for tree in selected_trees:
      output.append(
          {
              "loc": tree["loc"],
              "id": str(tree["_id"]),
              "arrond_name": tree["arrond_nom"],
              "tree_name_en": tree["essence_ang"],
              "tree_name_fr": tree["essence_fr"],
              "entry_status": tree["entry_status"],
              "up_votes": tree["up_votes"],
              "down_votes": tree["down_votes"]
          })
  
  fc = FeatureCollection([Feature(geometry=Point(doc['loc']), properties=doc) for doc in output])
  return dumps(fc)

@app.route('/upvote/<int:tree_id>', methods=['PUT'])
def upvote(tree_id):
    trees = mongo.db.trees
    tree = trees.find_one({"_id": ObjectId(tree_id)})


@app.route('/downvote/<int:tree_id>', methods=['PUT'])
def downvote(tree_id):
    pass



if __name__ == '__main__':
    app.run(debug=True)
