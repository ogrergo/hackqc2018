from pymongo import MongoClient, GEO2D
import pandas as pd

port = 27017
host = 'localhost'
csv_path = "../data/arbres-publics.csv"

db = MongoClient(host=host, port=port)['hackqc-2018']
db.trees.create_index([("loc", GEO2D)])

dat = pd.read_csv(csv_path)
dat = dat.dropna(subset=["Longitude", "Latitude"])
headers = ["ARROND", "ARROND_NOM", "Emplacement", "SIGLE", "Essence_latin", "Essence_fr", "ESSENCE_ANG",
           "DHP", "Date_releve", "Date_plantation", "NOM_PARC", "CODE_PARC"]
headers_lower = [h.lower() for h in headers]



db.trees.insert_many([
    {'loc': list(lat_lon),
     'up_votes': 0,
     'down_votes': 0,
        **dict(zip(headers_lower, row))
    }
    for row, lat_lon in zip(dat[headers].values, dat[["Longitude", "Latitude"]].values)])


