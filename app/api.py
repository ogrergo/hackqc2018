from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo
from bson import ObjectId
from geojson import Feature, Point, FeatureCollection, dumps
from utils.entry_status import EntryStatus
import json

app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'hackqc-2018'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/hackqc-2018'

mongo = PyMongo(app)

@app.route('/trees', methods=['GET'])
def get_trees():
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
              "arrond_name": tree.get("arrond_nom", ""),
              "tree_name_en": tree.get("essence_ang"),
              "tree_name_fr": tree.get("essence_fr"),
              "entry_status": tree.get("entry_status"),
              "dhp": tree.get("dhp", ""),
              "up_votes": tree.get("up_votes"),
              "down_votes": tree.get("down_votes")
          })
  
  fc = FeatureCollection([Feature(geometry=Point(doc['loc']), properties=doc) for doc in output])
  return dumps(fc)

@app.route('/upvote/<int:tree_id>', methods=['PUT'])
def upvote(tree_id):
    trees = mongo.db.trees

    before = trees.find_one({"_id": ObjectId(tree_id)})["up_votes"]

    tree = trees.update_one(
        {"_id": ObjectId(tree_id)},
        {"$inc": {"up_votes": 1}})

    after = trees.find_one({"_id": ObjectId(tree_id)})["up_votes"]
    assert before < after
    # TODO: Check if found and raise exception
    return "{'success': true}"

@app.route('/downvote/<int:tree_id>', methods=['PUT'])
def downvote(tree_id):
    trees = mongo.db.trees

    before = trees.find_one({"_id": ObjectId(tree_id)})["down_votes"]

    tree = trees.update_one(
        {"_id": ObjectId(tree_id)},
        {"$inc": {"down_votes": 1}})

    after = trees.find_one({"_id": ObjectId(tree_id)})["down_votes"]
    assert before < after
    # TODO: Check if found and raise exception
    return "{'success': true}"

@app.route('/trees', methods=['POST'])
def add_tree_request():

    trees = mongo.db.trees
    print(request.json)
    lat_long = request.json.get('latlon')
    name_en = request.json.get('name_en')
    name_fr = request.json.get('name_fr')
    name_latin = request.args.get('name_latin')
    entry_status = EntryStatus.REQUEST.value
    upvotes = 1
    downvotes = 0
    lat, long = [float(i) for i in lat_long.split(',')]
    doc = {
        "loc": [long, lat],
        "essence_ang": name_en,
        "essence_fr": name_fr,
        "essence_latin": name_latin,
        "entry_status": entry_status,
        "up_votes": upvotes,
        "down_votes": downvotes
    }
    trees.insert_one(doc)
    doc['id'] = str(doc['_id'])
    del doc['_id']

    return json.dumps(doc)

@app.route('/tree_proposals', methods=['GET'])
def get_tree_proposals():
    trees = mongo.db.trees

    lat_long_sw = request.args.get('latlon_sw')
    lat_long_ne = request.args.get('latlon_ne')

    if lat_long_ne and lat_long_sw:
        lat_sw, long_sw = [float(i) for i in lat_long_sw.split(',')]
        lat_ne, long_ne = [float(i) for i in lat_long_ne.split(',')]
        proposals = trees.find({'loc':
            {'$geoWithin':{
                '$box': [
                    [long_ne, lat_ne],
                    [long_sw, lat_sw]
                ]
            }},
            "entry_status": EntryStatus.REQUEST.value
        })
    else:
        proposals = trees.find({"entry_status": EntryStatus.REQUEST.value})

    res = []

    for tree in proposals:
        res.append({
              "loc": tree.get("loc"),
              "id": str(tree.get("_id")),
              "arrond_name": tree.get("arrond_nom"),
              "tree_name_en": tree.get("essence_ang"),
              "tree_name_fr": tree.get("essence_fr"),
              "entry_status": tree.get("entry_status"),
              "dhp": tree.get("dhp"),
              "up_votes": tree.get("up_votes"),
              "down_votes": tree.get("down_votes")
          })

    fc = FeatureCollection([Feature(geometry=Point(doc['loc']), properties=doc) for doc in res])
    return dumps(fc)

if __name__ == '__main__':
    app.run(debug=True)
