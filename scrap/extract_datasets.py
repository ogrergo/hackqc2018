import os
import shutil

import requests
from tqdm import tqdm
import re


import json

metadata_file = 'datasets_metadata.json'

def extract_datasets(root, dtypes):

    print("Downloading datasets to '{}' of types [{}]".format(root, ", ".join(dtypes)))

    for dataset in tqdm(metadata.values()):
        name = re.sub('/', '', dataset['title'].lower())

        for dtype, urls in dataset['urls'].items():
            if dtype not in dtypes:
                continue

            dataset_folder = os.path.join(root, '{}'.format(dtype))
            os.makedirs(dataset_folder, exist_ok=True)

            for i, url in enumerate(urls):
                filename = "{name}.{counter}.{dtype}".format(
                    name=name,
                    counter=i,
                    dtype=dtype
                )

                output_file = os.path.join(dataset_folder, filename)
                for _ in range(5):
                    try:
                        with requests.get(url, stream=True) as response, open(output_file, 'wb') as out_file:
                            shutil.copyfileobj(response.raw, out_file)
                    except Exception as e:
                        print(e.__repr__())
                        continue
                    break


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Download datasets of the openquebec from a metadata file')
    parser.add_argument('metadata_file', type=str, help='the file describing the datasets. Generated from scrap_openquebec.py')
    parser.add_argument('outfolder', type=str, help="The output dir where the datasaets are going to be downloaded.")

    parser.add_argument('--dtypes', type=str, nargs='+', help='the dtype to download.', default=['csv'])

    args = parser.parse_args()
    with open(args.metadata_file) as fp:
        metadata = json.load(fp)

    extract_datasets(root=args.outfolder, dtypes=args.dtypes)
