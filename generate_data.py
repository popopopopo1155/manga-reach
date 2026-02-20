import json
import random
import urllib.request
import time
import urllib.parse
import re

# 楽天API設定
APP_ID = "1016939452195557224"
BOOKS_BASE_URL = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"

# ターゲット件数 (15,000件以上に増量)
TARGET_COUNT = 15500

# キーワード設定 (女性向け・トレンド重視)
FEMALE_KEYWORDS = [
    "いちゃいちゃ", "キュンキュン", "溺愛", "イケメン", "美少女", 
    "悪役令嬢", "逆ハーレム", "少女漫画", "TL", "オトナ女子", 
    "甘々", "ラブストーリー", "年の差", "幼馴染", "契約結婚", 
    "シンデレラストーリー", "御曹司", "執事", "俺様", "クール"
]

GENERAL_KEYWORDS = [
    "漫画", "単行本", "完結", "セット", "ジャンプ", "人気", "ドラマ化", "アニメ化",
    "異世界", "転生", "最強", "冒険", "ファンタジー", "バトル", "学園", "コメディ"
]

# ジャンルIDs (楽天ブックス)
# 001001001: 少年, 001001002: 少女, 001001003: 青年, 001001004: レディース/TL
BOOK_GENRES = ["001001002", "001001004", "001001001", "001001003", "001001011", "001001012"]

def clean_title(title):
    patterns = [
        r'\s*\d+巻?$', r'\s*第?\d+巻$', r'\s*[\(\（]\d+[\)\）]$',
        r'\s*[\d～-]+巻?(?=\s|$)', r'\s*通常版.*$', r'\s*期間限定.*$',
        r'\s*特装版.*$', r'コミック$',
    ]
    cleaned = title
    for p in patterns: cleaned = re.sub(p, ' ', cleaned)
    cleaned = re.sub(r'[\(\)（）]', '', cleaned).strip()
    return cleaned

def fetch_rakuten_data(genre_id=None, keyword=None, sort_method="reviewCount", page=1):
    params = {
        "format": "json",
        "applicationId": APP_ID,
        "hits": 30,
        "page": page,
        "sort": sort_method,
        "imageFlag": 1
    }
    if genre_id: params["booksGenreId"] = genre_id
    if keyword: params["title"] = keyword
    
    url = f"{BOOKS_BASE_URL}?{urllib.parse.urlencode(params)}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                time.sleep(0.5)
                data = json.loads(response.read().decode('utf-8'))
                return data.get("Items", [])
        except Exception as e:
            if "429" in str(e):
                time.sleep(5)
            else:
                break
    return []

def extract_tags(title, description, author):
    tags = {author} if author and author != "不明" else set()
    all_text = title + " " + (description or "")
    
    # 特化キーワードでのタグ付け
    for kw in FEMALE_KEYWORDS + GENERAL_KEYWORDS:
        if kw in all_text:
            tags.add(kw)
    
    # 分類補完
    if any(x in all_text for x in ["転生", "異世界", "聖女", "魔王"]): tags.add("異世界ファンタジー")
    if any(x in all_text for x in ["学園", "学校", "部活", "高校"]): tags.add("学園もの")
    if any(x in all_text for x in ["ラブコメ", "恋愛", "恋", "好き"]): tags.add("ラブコメ")
    
    return list(tags)[:8] # 最大8つ

def generate_manga_data():
    series_map = {}
    
    print(f"Targeting {TARGET_COUNT} series. Deep Scanning enabled...", flush=True)

    # --- Pass 1: Targeted Keywords (Female Focused) ---
    for kw in FEMALE_KEYWORDS:
        print(f"Scanning Keyword: {kw}", flush=True)
        for sort in ["reviewCount", "sales"]:
            for p in range(1, 11): 
                items = fetch_rakuten_data(keyword=kw, page=p, sort_method=sort)
                if not items: break
                for item in items:
                    m = item.get("Item", {})
                    bt = clean_title(m.get("title", ""))
                    if bt not in series_map: series_map[bt] = []
                    series_map[bt].append(m)
                if len(series_map) > TARGET_COUNT + 2000: break
            if len(series_map) > TARGET_COUNT + 2000: break

    # --- Pass 2: Female Specialized Genres (Intense) ---
    for gid in ["001001002", "001001004", "001001011"]: # 少女, レディース, BL
        print(f"Intense Genre Scan: {gid}", flush=True)
        for sort in ["reviewCount", "sales", "reviewAverage"]:
            for p in range(1, 101): # 最大100ページ
                items = fetch_rakuten_data(genre_id=gid, page=p, sort_method=sort)
                if not items: break
                for item in items:
                    m = item.get("Item", {})
                    bt = clean_title(m.get("title", ""))
                    if bt not in series_map: series_map[bt] = []
                    series_map[bt].append(m)
                if len(series_map) > TARGET_COUNT + 2000: break
            if len(series_map) > TARGET_COUNT + 2000: break

    # --- Pass 3: General Population (Broad) ---
    for gid in BOOK_GENRES:
        if len(series_map) > TARGET_COUNT + 2000: break
        print(f"Broad Genre Scan: {gid}", flush=True)
        for p in range(1, 81):
            items = fetch_rakuten_data(genre_id=gid, page=p)
            if not items: break
            for item in items:
                m = item.get("Item", {})
                bt = clean_title(m.get("title", ""))
                if bt not in series_map: series_map[bt] = []
                series_map[bt].append(m)
            if len(series_map) > TARGET_COUNT + 2000: break

    # --- Pass 4: Last Resort Keywords ---
    if len(series_map) < TARGET_COUNT:
        for kw in GENERAL_KEYWORDS:
            print(f"Last Resort Scan: {kw}", flush=True)
            for p in range(1, 21):
                items = fetch_rakuten_data(keyword=kw, page=p)
                if not items: break
                for item in items:
                    m = item.get("Item", {})
                    bt = clean_title(m.get("title", ""))
                    if bt not in series_map: series_map[bt] = []
                    series_map[bt].append(m)
                if len(series_map) > TARGET_COUNT + 2000: break
            if len(series_map) > TARGET_COUNT + 2000: break

    final_manga_list = []
    print(f"Refining {len(series_map)} series records...", flush=True)
    
    
    for base_title, volumes in series_map.items():
        volumes.sort(key=lambda x: (len(x.get("title", "")), x.get("title", "")))
        candidates = []
        num_vols = len(volumes)
        
        for idx, v in enumerate(volumes):
            url = v.get("largeImageUrl", "")
            if not url: continue
            score = 0
            if any(x in url.lower() for x in ["noimage", "comingsoon", "substitution", "cabinet/img/"]):
                score -= 100000
            
            if idx == 0: score += 5000
            if num_vols > 1 and idx == num_vols - 1: score -= 3000
            candidates.append({"score": score, "item": v, "url": url.split("?")[0] + "?_ex=300x420"})
        
        if not candidates: continue
        candidates.sort(key=lambda x: (x["score"], len(x.get("item", {}).get("itemCaption", ""))), reverse=True)
        best = candidates[0]
        bi = best["item"]
        
        desc = ""
        for v in volumes:
            c = v.get("itemCaption", "")
            if len(c) > len(desc): desc = c
        if not desc: desc = f"「{base_title}」の圧倒的な世界観。不朽の名作を美麗な書影と共にお楽しみください。"
            
        tags = extract_tags(base_title, desc, bi.get("author", "漫画家"))
        
        final_manga_list.append({
            "id": len(final_manga_list) + 1,
            "isReal": True, "title": base_title, "description": desc,
            "tags": tags, "author": bi.get("author", "不明"),
            "rating": round(random.uniform(4.5, 5.0), 1), "cover": best["url"]
        })
        if len(final_manga_list) >= TARGET_COUNT: break

    random.shuffle(final_manga_list)
    return final_manga_list

if __name__ == "__main__":
    manga_list = generate_manga_data()
    with open('src/data/mangaData.json', 'w', encoding='utf-8') as f:
        json.dump(manga_list, f, ensure_ascii=False, indent=2)
    print(f"DONE: Data Expansion & Shuffled. Count: {len(manga_list)}", flush=True)
