import os
import shutil

import requests
from tqdm import tqdm
import re


import json

metadata_file = 'datasets_metadata.json'

def extract_datasets(root):
    for dataset in tqdm(metadata.values()):
        name = re.sub('/', '', dataset['title'].lower())

        for dtype, urls in dataset['urls'].items():
            if dtype not in ('csv', 'shp',):
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
    import sys
    if len(sys.argv) < 3:
        print("Usage: python extract_datasets.py metadata_file out_folder")
        sys.exit(1)


    with open(sys.argv[1]) as fp:
        metadata = json.load(fp)

    extract_datasets(root=sys.argv[2])
