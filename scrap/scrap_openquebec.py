import json

from collections import defaultdict
from selenium import webdriver
from urllib.parse import urlencode
from tqdm import tqdm
from itertools import count

def scrap(tags=None):
    options = webdriver.FirefoxOptions()
    options.set_headless()
    browser = webdriver.Firefox(options=options)

    dataset_entries = []

    if tags:
        filters = urlencode({'tags': s for s in tags})
    else:
        filters = ""

    for i in tqdm(count(1), "scrapping datasets list"):
        browser.get('https://www.donneesquebec.ca/recherche/fr/dataset?{filters}&page={page}'.format(page=i, filters=filters))

        xpath = '/html/body/div/div[6]/div[3]/div[2]/section/div[1]/div[position() >= 2]/div/h2/a'
        dataset_entries += [e.get_attribute('href') for e in browser.find_elements_by_xpath(xpath)]
        if not browser.find_elements_by_xpath("//div/ul/li/a/span[text()='Page suivante ']"):
            break

    datasets = {}

    for dataset_url in tqdm(dataset_entries, "scrapping datasets"):
        browser.get(dataset_url)

        description = "\n".join(t.text for t in browser.find_elements_by_xpath("/html/body/div/div[6]/div[2]/div/div[2]/div/p")).strip()
        title = "".join(t.text for t in browser.find_elements_by_xpath('//h1')).strip().split('\n')[0]

        metadata_table = {}

        # metadata table
        for line in browser.find_elements_by_xpath("//table/tbody/tr"):
            key = line.find_element_by_xpath('th').text
            value = line.find_element_by_xpath('td')

            list_elems = value.find_elements_by_xpath('a')
            if list_elems:
                value = [t.text for t in list_elems]
            else:
                value = value.text

            if not value:
                continue

            metadata_table[key] = value

        # tags = [t.text for t in browser.find_elements_by_xpath("//li[@data-display = 'tags']/a")]

        urls = []
        for res_div in browser.find_elements_by_xpath("//section[@id='dataset-resources']/div"):
            type = res_div.find_element_by_xpath("div/span").get_attribute('data-format')

            # if type not in ('csv', 'shp', 'geojson', 'kml', 'xlsx'):
            #     print("Unknown type {}".format(type))
            #     continue

            url = res_div.find_element_by_xpath("div[2]/a").get_attribute('href')
            urls.append((type, url))

        _urls = defaultdict(list)

        for t, u in urls:
            browser.get(u)
            u = browser.find_element_by_xpath("/html/body/div/div[6]/section[1]/div/div[1]/div/div/a[1]").get_attribute('href')
            _urls[t].append(u)

        urls = dict(_urls)

        if not urls:
            continue

        datasets[dataset_url] = {
            'page_url': dataset_url,
            'title': title,
            'urls': urls,
            'description': description,
            **metadata_table
        }

    return datasets


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Usage: python scrap_openquebec.py metadata_out_file [tag0 [tag1 [...]]]")
        sys.exit(1)

    datasets = scrap(tags=sys.argv[2:])

    with open(sys.argv[1], 'w') as fp:
        json.dump(datasets, fp=fp, indent=True, ensure_ascii=False)

