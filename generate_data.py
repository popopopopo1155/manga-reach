import json
import random
import urllib.request
import time
import urllib.parse
import re

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
    "夜桜さんちの大作戦", "SAKAMOTO DAYS", "ウィッチウォッチ", "逃げ上手の若君",
    "ハコヅメ", "チ。―地球の運動について―", "違国日記", "海街diary", "スキップとローファー",
    "火の鳥", "ベルサイユのばら", "ポーの一族", "寄生獣", "ピンポン", "AKIRA",
    "うる星やつら", "めぞん一刻", "らんま1/2", "犬夜叉", "タッチ", "H2", "MIX",
    "美少女戦士セーラームーン", "カードキャプターさくら", "フルーツバスケット", "NANA", "ハチミツとクローバー",
    "のだめカンタービレ", "君に届け", "アオハライド", "俺物語!!", "ちはやふる",
    "ワンパンマン", "モブサイコ100", "東京喰種", "亜人", "ブラッククローバー", "七つの大罪",
    "北斗の拳", "聖闘士星矢", "キン肉マン", "キャプテン翼", "ドクタースランプ", "DEATH NOTE",
    "約束のネバーランド", "暗殺教室", "食戟のソーマ", "黒子のバスケ", "テニスの王子様",
    "SLAM DUNK", "HUNTER×HUNTER", "宇宙兄弟", "3月のライオン", "よつばと!", "キングダム",
    "ゴールデンカムイ", "踏んだり、蹴ったり、愛したり", "ゆびさきと恋々", "うるわしの宵の月", 
    "ハニーレモンソーダ", "山田くんとLv999の恋をする", "わたしの幸せな結婚", 
    "星降る王国のニナ", "氷の城壁", "煙たい男と目隠し令嬢",
    "魔女と傭兵", "高度に発達した医学は魔法と区別がつかない", "異世界刀匠の魔剣製作ぐらし",
    "シャングリラ・フロンティア", "ダンジョン飯", "無職転生", "オーバーロード", "Re:ゼロから始める異世界生活",
    "姉のともだち", "悪役令嬢たちは揺るがない", "となりの席のヤツがそういう目で見てくる",
    "正反対な君と僕", "誰か夢だと言ってくれ", "変な家", "恋する(おとめ)の作り方", "薫る花は凛と咲く",
    "ベルセルク", "20世紀少年", "MONSTER", "バガボンド", "ROOKIES", "金色のガッシュ!!", 
    "封神演義", "るろうに剣心", "あしたのジョー", "ガラスの仮面", "デビルマン", 
    "銀河鉄道999", "巨人の星", "ゴルゴ13", "さよなら絵梨", "ルックバック"
]

FEMALE_KEYWORDS = [
    "いちゃいちゃ", "キュンキュン", "溺愛", "イケメン", "美少女", 
    "悪役令嬢", "逆ハーレム", "少女漫画", "TL", "オトナ女子", 
    "甘々", "ラブストーリー", "年の差", "幼馴染", "契約結婚", 
    "シンデレラストーリー", "御曹司", "執事", "俺様", "クール"
]

GENERAL_KEYWORDS = [
    "漫画", "単行本", "完結", "人気", "ドラマ化", "アニメ化",
    "異世界", "転生", "最強", "冒険", "ファンタジー", "バトル", "学園", "コメディ"
]

SEINEN_DARK_KEYWORDS = {
    "極道・ヤクザ": ["極道", "ヤクザ", "組長", "若頭", "裏社会", "任侠", "闇金", "ウシジマ"],
    "ホラー・グロ": ["ホラー", "グロ", "残酷", "猟奇", "バイオレンス", "呪い", "恐怖", "パニック"],
    "サスペンス": ["サスペンス", "心理戦", "ミステリー", "謎解き", "復讐", "デスゲーム"],
    "エッチ系": ["エッチ", "セクシー", "お色気", "ちょっとエッチ", "ハーレム", "サービスシーン"]
}

def clean_title(title):
    if not title: return ""
    # 特殊なパターンを前に
    title = re.sub(r'\(?([Jj][Uu][Mm][Pp]|[Cc][Oo][Mm][Ii][Cc][Ss]).*$', '', title, flags=re.IGNORECASE)
    title = re.sub(r'[Pp]art\s*\d+\s*$', '', title, flags=re.IGNORECASE)
    
    # 完全に排除したいキーワード（末尾）
    # 「編」なども含めて貪欲に削る
    suffix_patterns = [
        r'\s*(新装版|完全版|愛蔵版|文庫版|通常版|期間限定|特装版|限定版|普及版|デラックス版|SPECIAL EDITION|MEMORIAL|キャラクターブック|公式ガイド|画集|イラスト集|アンソロジー|ビジュアルブック|ガイドブック).*$',
        r'コミック$', r'\s*.*[巻編]$', r'\s*［.+集］$', r'\s*I+$', r'\s*vol\.?\s*\d+.*$',
        r'（分冊版）$', r'\(分冊版\)$', r'\s*Final\s*Edition.*$',
    ]
    for p in suffix_patterns:
        title = re.sub(p, '', title, flags=re.IGNORECASE).strip()

    # 巻数・数字の徹底排除
    patterns = [
        r'第?[\d～-]+巻?[上下]?$', 
        r'[\(\（]\d+[\)\）]$',
        r'\s*\d+$', 
        r'[\d～-]+巻?(?=\s|$)',
        r'[ \s]?[上下]巻$',
    ]
    cleaned = title
    for p in patterns:
        cleaned = re.sub(p, '', cleaned, flags=re.IGNORECASE).strip()
    
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
    
    # 伝説級タイトルはNGワードチェックをバイパスする（高度に発達した「医学」などは許可）
    if any(lt.lower() in title.lower() for lt in LEGENDARY_TITLES):
        return True

    # 雑誌本体（〜号、〜年月）を排除
    if re.search(r'\d{4}年\s*\d+号', title) or re.search(r'\d+号$', title):
        return False

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
        except Exception:
            time.sleep(2)
    return []

def extract_tags(title, description, author, genre_id):
    tags = set()
    if author and author != "不明": tags.add(author)
    all_text = (title + " " + (description or "")).lower()
    
    for kw in FEMALE_KEYWORDS + GENERAL_KEYWORDS:
        if kw in all_text: tags.add(kw)
    
    if genre_id == "001001003": # 青年漫画
        for tag_name, keywords in SEINEN_DARK_KEYWORDS.items():
            if any(k in all_text for k in keywords): tags.add(tag_name)
    
    if genre_id == "001001002": tags.add("少女漫画")
    if genre_id == "001001004": tags.add("女性向け")
    if any(x in all_text for x in ["転生", "異世界", "聖女", "魔王"]): tags.add("異世界ファンタジー")
    if any(x in all_text for x in ["学園", "学校", "部活", "高校"]): tags.add("学園もの")
    if any(x in all_text for x in ["ラブコメ", "恋愛", "恋", "好き"]): tags.add("ラブコメ")
    
    return list(tags)[:8]

def generate_manga_data():
    series_map = {}
    print(f"Targeting {TARGET_COUNT} series. Starting data collection...", flush=True)

    # Pass 0: Legendary Titles
    print("Pass 0: Legendary Focused Scan Starting...", flush=True)
    for i, title in enumerate(LEGENDARY_TITLES):
        if i % 10 == 0: print(f"Processing Legend {i}/{len(LEGENDARY_TITLES)}", flush=True)
        items = fetch_rakuten_data(keyword=title, page=1, sort_method="reviewCount")
        for item in items:
            m = item.get("Item", {})
            bt = clean_title(m.get("title", ""))
            if is_manga(bt, m.get("itemCaption", ""), m.get("booksGenreId", "")):
                if bt not in series_map: series_map[bt] = []
                series_map[bt].append(m)

    # Pass 1: Keywords
    for kw in FEMALE_KEYWORDS + GENERAL_KEYWORDS:
        if len(series_map) > TARGET_COUNT + 1000: break
        print(f"Scanning Keyword: {kw}", flush=True)
        for p in range(1, 10):
            items = fetch_rakuten_data(keyword=kw, page=p, sort_method="reviewCount")
            if not items: break
            for item in items:
                m = item.get("Item", {})
                bt = clean_title(m.get("title", ""))
                if is_manga(bt, m.get("itemCaption", ""), m.get("booksGenreId", "")):
                    if bt not in series_map: series_map[bt] = []
                    series_map[bt].append(m)

    # Pass 2: Genres
    for gid in BOOK_GENRES:
        if len(series_map) > TARGET_COUNT + 1000: break
        print(f"Scanning Genre: {gid}", flush=True)
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
        final_list.append({
            "id": len(final_list) + 1,
            "isReal": True, "title": title, "description": desc,
            "tags": extract_tags(title, desc, bi.get("author", "漫画家"), gid),
            "author": bi.get("author", "不明"),
            "rating": round(random.uniform(4.7, 5.0) if is_legend else random.uniform(4.4, 4.9), 1),
            "cover": best["url"], "genreId": gid, "isLegendary": is_legend
        })

    legends = [m for m in final_list if m["isLegendary"]]
    others = [m for m in final_list if not m["isLegendary"]]
    
    # レジェンド作品の中でも特に有名なものを上位に（任意調整）
    # ここではランダムシャッフルするが、物理的に先頭に来ることを保証
    random.shuffle(legends)
    random.shuffle(others)
    
    # 完全にレジェンドを先頭に固定
    return legends + others

if __name__ == "__main__":
    data = generate_manga_data()
    with open('src/data/mangaData.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"DONE. Total: {len(data)}", flush=True)
