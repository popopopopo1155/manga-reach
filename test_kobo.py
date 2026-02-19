import json
import urllib.request
import urllib.parse

APP_ID = "1016939452195557224"
KOBO_BASE_URL = "https://app.rakuten.co.jp/services/api/Kobo/EbookSearch/20170412"

def test_kobo():
    params = {
        "format": "json",
        "applicationId": APP_ID,
        "hits": 5,
        "page": 1,
        "sort": "reviewCount",
        "koboGenreId": "101" # 漫画全般
    }
    url = f"{KOBO_BASE_URL}?{urllib.parse.urlencode(params)}"
    print(f"Testing URL: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            items = data.get("Items", [])
            print(f"Found {len(items)} items.")
            if items:
                first = items[0].get("Item", {})
                print(f"First Item Title: {first.get('title')}")
                print(f"Has Caption: {bool(first.get('itemCaption'))}")
                print(f"Caption Length: {len(first.get('itemCaption', ''))}")
                print(f"Large Image URL: {first.get('largeImageUrl')}")
            else:
                print(f"Full Response: {data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_kobo()
