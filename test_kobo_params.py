import json
import urllib.request
import urllib.parse
import time

APP_ID = "1016939452195557224"
KOBO_BASE_URL = "https://app.rakuten.co.jp/services/api/Kobo/EbookSearch/20170412"

def test_params(name, p):
    url = f"{KOBO_BASE_URL}?{urllib.parse.urlencode(p)}"
    print(f"Testing {name}: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"  OK! Found {data.get('count', 0)} items.")
    except Exception as e:
        print(f"  FAIL: {e}")

if __name__ == "__main__":
    # Test 1: Minimal with title
    test_params("MinimalTitle", {"format": "json", "applicationId": APP_ID, "title": "ONE PIECE"})
    
    # Test 2: With Kobo Genre
    test_params("KoboGenre", {"format": "json", "applicationId": APP_ID, "koboGenreId": "101"})
    
    # Test 3: With sort=sales
    test_params("SortSales", {"format": "json", "applicationId": APP_ID, "koboGenreId": "101", "sort": "sales"})

    # Test 4: With sort=reviewCount
    test_params("SortReviewCount", {"format": "json", "applicationId": APP_ID, "koboGenreId": "101", "sort": "reviewCount"})
