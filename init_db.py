from pymongo import MongoClient, GEO2D
import pandas as pd
from utils.entry_status import EntryStatus

ville = 'montreal'

if __name__ == "__main__":

    port = 27017
    host = 'localhost'
    db = MongoClient(host=host, port=port)['hackqc-2018']
    db.trees.create_index([("loc", GEO2D)])

    qc_mtl = {
        'NOM_LATIN': 'essence_latin',
        'NOM_FRANCAIS': 'essence_fr',
        'NOM_TOPOGRAPHIE': 'nom_parc',
        'LATITUDE': 'latitude',
        'LONGITUDE': 'longitude',
        'TYPE_LIEU': 'emplacement',
        'DATE_PLANTE': 'date_plantation'
    }

    if ville == 'quebec':
        csv_path = "data/vdq-arbrerepertorie.csv"
        long_key = "LONGITUDE"
        lat_key = "LATITUDE"
        headers = ['TYPE_LIEU', 'NOM_LATIN', 'NOM_FRANCAIS', 'DATE_PLANTE', 'LATITUDE', 'LONGITUDE', 'NOM_TOPOGRAPHIE']
        headers_lower = [qc_mtl[h] for h in headers]
        city = 'QC'
    else:
        csv_path = "data/arbres-publics.csv"
        headers = ["ARROND", "ARROND_NOM", "Emplacement", "SIGLE", "Essence_latin", "Essence_fr", "ESSENCE_ANG",
                   "DHP", "Date_releve", "Date_plantation", "NOM_PARC", "CODE_PARC"]
        headers_lower = [h.lower() for h in headers]
        long_key = "Longitude"
        lat_key = "Latitude"
        city = "MTL"

    dat = pd.read_csv(csv_path)
    dat = dat.dropna(subset=[long_key, lat_key])

    db.trees.insert_many([
        {'loc': list(long_lat),
         'up_votes': 0,
         'down_votes': 0,
         'entry_status': EntryStatus.TRUE_POSITIVE.value,
         'city': city,
            **dict(zip(headers_lower, row))
        }
        for row, long_lat in zip(dat[headers].values, dat[[long_key, lat_key]].values)])


