from pymongo import MongoClient, GEO2D
import pandas as pd
from tqdm import tqdm
from utils.entry_status import EntryStatus
import argparse

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Populate MongoDB')
    parser.add_argument('-c', '--city', required=True, help='City from which to take data', default='mtl',
                        choices=['qc', 'mtl', 'rep', 'all'])

    args = parser.parse_args()
    ville = args.city
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

    rep_mtl = {
        'Latitude': 'latitude',
        'Longitude': 'longitude',
        'ESSENCE_FR': 'essence_fr',
        'ESSENCE_LATIN': 'essence_latin',
        'DATE_PLANTATION': 'date_plantation'
    }

    if ville == 'quebec':
        csv_path = "data/vdq-arbrerepertorie.csv"
        dat = pd.read_csv(csv_path)
        long_key = "LONGITUDE"
        lat_key = "LATITUDE"
        headers = ['TYPE_LIEU', 'NOM_LATIN', 'NOM_FRANCAIS', 'DATE_PLANTE', 'LATITUDE', 'LONGITUDE', 'NOM_TOPOGRAPHIE']
        headers_lower = [qc_mtl[h] for h in headers]
        city = 'QC'
    elif ville == 'rep':
        csv_path = "data/arbres.csv"
        dat = pd.read_csv(csv_path, encoding='latin-1')
        headers = ['ESSENCE_FR', 'ESSENCE_LATIN', 'Latitude', 'Longitude', 'DATE_PLANTATION']
        headers_lower = [rep_mtl[h] for h in headers]
        long_key = "Longitude"
        lat_key = "Latitude"
        city = 'REP'
    else:
        csv_path = "data/arbres-publics.csv"
        dat = pd.read_csv(csv_path)
        headers = ["ARROND", "ARROND_NOM", "Emplacement", "SIGLE", "Essence_latin", "Essence_fr", "ESSENCE_ANG",
                   "DHP", "Date_releve", "Date_plantation", "NOM_PARC", "CODE_PARC"]
        headers_lower = [h.lower() for h in headers]
        long_key = "Longitude"
        lat_key = "Latitude"
        city = "MTL"

    dat = dat.dropna(subset=[long_key, lat_key])

    for row, long_lat in tqdm(zip(dat[headers].values, dat[[long_key, lat_key]].values)):
        db.trees.insert_one(
                {'loc': list(long_lat),
                'up_votes': 0,
                'down_votes': 0,
                 'city': city,
                'entry_status': EntryStatus.TRUE_POSITIVE.value,
                **dict(zip(headers_lower, row))
                })