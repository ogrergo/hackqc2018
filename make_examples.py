from pymongo import MongoClient
from utils.entry_status import EntryStatus

port = 27017
host = 'localhost'
trees = MongoClient(host=host, port=port)['hackqc-2018'].trees


to_add = [
    "45.50133520261513, -73.57344925403596",
    "45.49489415784694, -73.56345534324647",
    "45.494961843408646, -73.5587775707245",
    "45.49317942981423, -73.55878829956056",
    "45.49038912479393, -73.5632085800171",
    "45.491803097175534, -73.56201767921449",
    "45.50221124810269, -73.55830550193788",
    "45.5017036697601, -73.55723798274995",
    "45.50427159320051, -73.57028424739839",
    "45.53049304646717, -73.60085606575014",
    "45.52949342728472, -73.6008131504059",
    "45.53889515800797, -73.58724653720857",
    "45.53283794806151, -73.65090608596803"]


for lat_long in to_add:
    name_en = 'test'
    name_fr = 'test'
    name_latin = 'test'
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