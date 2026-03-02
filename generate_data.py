import json
import random
import urllib.request
import time
import urllib.parse
import re
import hashlib

# 楽天API設定
APP_ID = "1016939452195557224"
BOOKS_BASE_URL = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"

# ターゲット件数
TARGET_COUNT = 15500

# ジャンルIDs (楽天ブックス)
BOOK_GENRES = ["001001001", "001001002", "001001003", "001001004", "001001006", "001001007", "001001008"]

# 有名作品・レジェンド枠
LEGENDARY_TITLES = [
    "ONE PIECE", "NARUTO", "BLEACH", "鬼滅の刃", "呪術廻戦", "チェンソーマン", 
    "僕のヒーローアカデミア", "ハイキュー", "銀魂", "HUNTER×HUNTER", "幽☆遊☆白書", 
    "ドラゴンボール", "スラムダンク", "進撃の巨人", "鋼の錬金術師", "DEATH NOTE",
    "こちら葛飾区亀有公園前派出所", "ジョジョの奇妙な冒険", "キングダム", 
    "ゴールデンカムイ", "SPY×FAMILY", "推しの子", "ブルーロック", "怪獣8号",
    "名探偵コナン", "ドラえもん", "クレヨンしんちゃん", "サザエさん", "ブラック・ジャック",
    "葬送のフリーレン", "薬屋のひとりごと", "アオのハコ", "アオアシ", "ダンダダン", 
    "転生したらスライムだった件", "カグラバチ", "君と宇宙を歩くために", "環と周",
    "ふつうの軽音部", "雷雷雷", "魔男のイチ", "3月のライオン", "宇宙兄弟",
    "よつばと", "ちはやふる", "暁のヨナ", "赤髪の白雪姫", "君に届け", "ヲタクに恋は難しい",
    "東京卍リベンジャーズ", "ブルーピリオド", "地獄楽", "マッシュル", "アンデッドアンラック",
    "ベルセルク", "20世紀少年", "MONSTER", "バガボンド", "ROOKIES", "金色のガッシュ!!", "封神演義", "るろうに剣心",
    "あしたのジョー", "ガラスの仮面", "デビルマン", "銀河鉄道999", "巨人の星", "ゴルゴ13",
    "踏んだり、蹴ったり、愛したり", "正反対な君と僕", "姉のともだち", "悪役令嬢たちは揺るがない",
    "高度に発達した医学は魔法と区別がつかない", "魔女と傭兵", "異世界刀匠の魔剣製作ぐらし",
    "となりの席のヤツがそういう目で見てくる", "誰か夢だと言ってくれ", "変な家", "恋する(おとめ)の作り方", "薫る花は凛と咲く"
]

def generate_commentary(title, author, is_legendary):
    if not is_legendary:
        return f"『{title}』は、{author}先生が描く魅力溢れる作品です。独自の展開とテンポの良い構成で、多くの読者から支持されています。"
    
    # 伝説級作品への特別コメント
    commentaries = [
        f"漫画史に燦然と輝く金字塔、それがこの『{title}』です。{author}先生の圧倒的な筆致と、時を経ても色褪せない深い人間ドラマは、全世代の読者が一度は体験すべき至高のエンターテインメントと言えるでしょう。",
        f"『{title}』は単なる漫画の枠を超えた「体験」そのものです。{author}先生が生み出した独創的な世界観と、心を揺さぶる名シーンの数々は、読むたびに新しい発見を与えてくれます。まさに伝説と呼ぶに相応しい一冊です。",
        f"多くの後継作に影響を与え続けている傑作『{title}』。{author}先生の計算し尽くされたストーリー構成と、キャラクターたちの熱い生き様は、現代でもなおトップクラスの求心力を誇っています。"
    ]
    return random.choice(commentaries)

def clean_title(title):
    cleaned = re.sub(r'[\d１２３４５６７８９０]+\s*巻.*', '', title)
    cleaned = re.sub(r'\(.*?\)|（.*?）', '', cleaned)
    cleaned = re.sub(r'【.*?】|\[.*?\]', '', cleaned)
    cleaned = re.sub(r'[\(\)（）]', '', cleaned).strip()
    return cleaned

NEGATIVE_KEYWORDS = [
    "楽譜", "スコア", "画集", "設定資料集", "イラスト集", "カレンダー", "雑誌", "攻略本",
    "実用", "教本", "入門", "解説", "ガイド", "テキスト", "問題集", "事典", "辞典",
    "アトラス", "のための", "コメディカル", "臨床", "医学", "看護", "図鑑", "学習",
    "アンソロジー", "ファンブック", "ポストカード", "手帳", "日記", "ぬりえ",
    "BOX", "ボックス", "セット", "全巻", "合本", "ベストシーン", "テレビ絵本", "絵本",
    "総集編", "増刊", "ドラマCD", "限定版", "特装版", "アニメコミック",
    "小説", "ノベル", "ライトノベル", "ラノベ", "文庫版", "チャットノベル",
    "illustration", "art book", "visual book", "guide book", "character book",
    "画集", "イラスト作品集", "公式ガイド"
]

def is_manga(title, description, genre_id):
    if genre_id and not genre_id.startswith("001001"): return False
    if any(lt.lower() in title.lower() for lt in LEGENDARY_TITLES): return True
    if re.search(r'\d{4}年\s*\d+号', title) or re.search(r'\d+号$', title): return False
    text = (title + " " + (description or "")).lower()
    if any(nk.lower() in text for nk in NEGATIVE_KEYWORDS): return False
    study_patterns = [r'マンガでわかる', r'まんがでわかる', r'漫画でわかる', r'はじめての', r'ポケットアトラス', r'入門編', r'図解']
    if any(re.search(p, text, re.IGNORECASE) for p in study_patterns): return False
    return True

def fetch_rakuten_data(genre_id=None, keyword=None, sort_method="reviewCount", page=1):
    params = {
        "format": "json", "applicationId": APP_ID, "hits": 30, "page": page,
        "sort": sort_method, "imageFlag": 1, "booksGenreId": genre_id or "001001"
    }
    if genre_id and not genre_id.startswith("001001"): params["booksGenreId"] = "001001"
    if keyword: params["title"] = keyword
    url = f"{BOOKS_BASE_URL}?{urllib.parse.urlencode(params)}"
    for _ in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                time.sleep(0.3)
                data = json.loads(response.read().decode('utf-8'))
                return data.get("Items", [])
        except Exception: time.sleep(2)
    return []

def extract_tags(title, description, author, genre_id):
    tags = set()
    if "001001001" in genre_id: tags.add("少年漫画")
    elif "001001002" in genre_id: tags.add("少女漫画")
    elif "001001003" in genre_id: tags.add("青年漫画")
    elif "001001004" in genre_id: tags.add("レディース")
    if author and author != "不明": tags.add(author)
    kw_map = {"異世界": "異世界", "ファンタジー": "ファンタジー", "ラブコメ": "ラブコメ", "恋愛": "恋愛", "スポーツ": "スポーツ", "バトル": "バトル", "アクション": "アクション", "サスペンス": "サスペンス", "ホラー": "ホラー", "学園": "学園", "日常": "日常"}
    full_text = title + " " + description
    for k, v in kw_map.items():
        if k in full_text: tags.add(v)
    return list(tags)

def generate_manga_data():
    series_map = {}
    
    # 1. 伝説級・有名作品を確実に取得
    for lt in LEGENDARY_TITLES:
        items = fetch_rakuten_data(keyword=lt)
        for item in items:
            m = item.get("Item", {})
            bt = clean_title(m.get("title", ""))
            if lt.lower() in bt.lower() and is_manga(bt, m.get("itemCaption", ""), m.get("booksGenreId", "")):
                if bt not in series_map: series_map[bt] = []
                series_map[bt].append(m)
                break

    # 2. 各ジャンルから人気順に取得
    for gid in BOOK_GENRES:
        print(f"Fetching genre {gid}...", flush=True)
        for p in range(1, 50):
            items = fetch_rakuten_data(genre_id=gid, page=p, sort_method="reviewCount")
            if not items: break
            for item in items:
                m = item.get("Item", {})
                bt = clean_title(m.get("title", ""))
                if is_manga(bt, m.get("itemCaption", ""), m.get("booksGenreId", "")):
                    if bt not in series_map: series_map[bt] = []
                    series_map[bt].append(m)

    final_list = []
    print(f"Refining {len(series_map)} titles...", flush=True)
    for title, volumes in series_map.items():
        is_legend = any(lt.lower() in title.lower() for lt in LEGENDARY_TITLES)
        candidates = []
        for idx, v in enumerate(volumes):
            url = v.get("largeImageUrl", "")
            if not url or "noimage" in url.lower(): continue
            score = 10000 if is_legend else 0
            if idx == 0: score += 1000
            candidates.append({"score": score, "item": v, "url": url.split("?")[0] + "?_ex=300x420"})
        
        if not candidates: continue
        best = sorted(candidates, key=lambda x: x["score"], reverse=True)[0]
        bi = best["item"]
        desc = bi.get("itemCaption", "")
        if not desc: desc = f"「{title}」の圧倒的な世界観。不朽の名作を美麗な書影とお楽しみください。"
        
        gid = bi.get("booksGenreId", "001001")
        author = bi.get("author", "不明")
        
        final_list.append({
            "id": hashlib.md5((title + author).encode()).hexdigest()[:12],
            "title": title, "description": desc,
            "commentary": generate_commentary(title, author, is_legend),
            "tags": extract_tags(title, desc, author, gid),
            "author": author,
            "rating": round(random.uniform(4.7, 5.0) if is_legend else random.uniform(4.4, 4.9), 1),
            "cover": best["url"], "genreId": gid, "isLegendary": is_legend
        })

    legends = [m for m in final_list if m["isLegendary"]]
    others = [m for m in final_list if not m["isLegendary"]]
    random.shuffle(legends)
    random.shuffle(others)
    return legends + others

if __name__ == "__main__":
    data = generate_manga_data()
    # 2,700件程度に絞るか、またはそのまま出力
    with open('src/data/mangaData.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"DONE. Total: {len(data)}", flush=True)
