import json
import urllib.request
import urllib.parse

APP_ID = "1016939452195557224"
BOOKS_URL = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"
KOBO_URL = "https://app.rakuten.co.jp/services/api/Kobo/EbookSearch/20170412"

def test_api(name, url, p):
    full_url = f"{url}?{urllib.parse.urlencode(p)}"
    print(f"Testing {name}: {full_url}")
    try:
        req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"  OK! Count: {data.get('count', 0)}")
    except Exception as e:
        print(f"  FAIL: {e}")

if __name__ == "__main__":
    # Books API (should work)
    test_api("BooksOK", BOOKS_URL, {"format": "json", "applicationId": APP_ID, "title": "ONE PIECE"})
    
    # Kobo API (failing)
    test_api("KoboFail", KOBO_URL, {"format": "json", "applicationId": APP_ID, "title": "ONE PIECE"})
