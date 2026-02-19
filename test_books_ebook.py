import json
import urllib.request
import urllib.parse

APP_ID = "1016939452195557224"
# Koboではない、Booksの電子書籍検索
BOOKS_EBOOK_URL = "https://app.rakuten.co.jp/services/api/BooksEbook/Search/20170404"

def test_books_ebook():
    params = {
        "format": "json",
        "applicationId": APP_ID,
        "title": "ONE PIECE",
        "hits": 5
    }
    url = f"{BOOKS_EBOOK_URL}?{urllib.parse.urlencode(params)}"
    print(f"Testing BooksEbook: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"  OK! Count: {data.get('count', 0)}")
            if data.get("Items"):
                print(f"  First Item: {data['Items'][0]['Item']['title']}")
                print(f"  Image: {data['Items'][0]['Item']['largeImageUrl']}")
    except Exception as e:
        print(f"  FAIL: {e}")

if __name__ == "__main__":
    test_books_ebook()
