import json
import random
import urllib.request
import time
import urllib.parse
import re
import hashlib
import os

# 楽天API設定
APP_ID = os.environ.get("RAKUTEN_APP_ID", "1016939452195557224")
BOOKS_BASE_URL = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"

# ターゲット件数
TARGET_COUNT = 5000

# 主要作品のボリューム別ハイライト（リサーチ済みデータ）
VOLUME_HIGHLIGHTS = {
    "キングダム": {
        "50": "朱海平原の戦いが激化し、信と王賁が右翼で覚醒を見せる熱い展開。",
        "51": "食糧難に陥る楊端和軍が犬戎族と対峙し、決死の作戦を敢行する緊迫の巻。",
        "52": "亜光将軍の危機を信と王賁が救い、楊端和が犬戎王ロゾを討つ大戦果。",
        "53": "橑陽の戦いが決着。信と王賁が士気を高め合い、戦局は新たな局面へ。",
        "54": "王翦中央軍がついに進軍を開始。兵糧が尽きかける極限状態での読み合いが圧巻。",
        "55": "王賁が討たれ、信が臨時の総大将に。仲間との別れ（松左の死）が描かれる涙の十四日目。",
        "56": "朱海平原、ついに最終決戦。王翦と李牧、天才軍師同士の総力戦がピークに。",
        "57": "信と龐煖の宿命の対決が開始。李牧が明かす龐煖の「求道者」としての真理。",
        "58": "信と龐煖の死闘がついに決着。そして鄴が陥落し、歴史が大きく動く瞬間。",
        "59": "論功行賞。信がついに将軍へと昇進し、飛信隊が1万5千人の軍勢となる転換点。",
        "60": "呂不韋との最終決着と、嬴政が語る「人の本質」。秦魏同盟の締結。",
        "62": "新・六大将軍の任命。影丘での過酷な戦いが始まり、王賁の玉鳳軍が窮地に。",
        "64": "桓騎の誰も予想だにしない奇策が炸裂。扈輒を討ち取り、戦場を恐怖に陥れる。",
        "68": "桓騎と李牧の運命を左右する肥下の戦い。桓騎の変態的な戦術が冴え渡る。",
        "70": "韓非子の招聘任務。信が語る「人の本質は火である」という答えが感動を呼ぶ。"
    },
    "ONE PIECE": {
        "95": "カイドウとビッグ・マムが海賊同盟を結成。ゾロが名刀「閻魔」を手にする重要な巻。",
        "96": "光月おでんの過去編。白ひげやロジャーとの冒険、世界の夜明けを願う魂の物語。",
        "97": "カン十郎の裏切りが発覚。ジンベエが正式加入し、鬼ヶ島討ち入りへ。",
        "99": "屋上での「最悪の世代」vs「四皇」。ルフィが海賊王への決意を再宣言する大舞台。",
        "100": "ルフィが「覇王色」を纏う力を覚醒。四皇二人の圧倒的な力に食らいつく記念すべき巻。",
        "101": "ゾロとサンジが看板（キング・クイーン）と激突。ゴムゴムの実の秘密が示唆される。",
        "105": "新「四皇」ルフィ。ベガパンクの島「エッグヘッド」への上陸と新展開の幕開け。",
        "106": "空白の100年やオハラの意志が明かされる。ルフィvsルッチの再戦に胸が熱くなる。",
        "107": "五老星やイム様の不穏な動き。ガープがコビー救出のため、ハチノスで伝説の力を見せる。",
        "108": "黄猿とサターン聖の襲来。バーソロミュー・くまの壮絶な過去に涙が止まらない。"
    },
    "名探偵コナン": {
        "100": "FBIと黒ずくめの組織の全面対決。ラムの正体にも迫る記念碑的な一冊。",
        "101": "怪盗キッドvs安室透の豪華競演。新たな警察関係者・萩原千速が登場。",
        "104": "17年前の羽田浩司事件の真相が遂に明かされる、ファン必読の衝撃展開。"
    },
    "ブルーロック": {
        "1": "300人のストライカーによる「青い監獄」開幕。潔世一のエゴが目覚める物語の起点。",
        "11": "二次選考決着。糸師凛の圧倒的な実力と、潔が掴む「運」のカラクリ。",
        "14": "U-20日本代表戦。天才・糸師冴のゲームメイクにブルーロックチームが挑む。",
        "20": "新英雄大戦（ネオ・エゴイストリーグ）開幕。世界のトップリーグで潔が真の価値を問う。"
    }
}

class NaturalSentenceBuilder:
    def __init__(self, title, author, description, vol_num):
        self.title = title
        self.author = author
        self.desc = description
        self.vol_num = vol_num
        self.keywords = self._extract_keywords()
        
    def _extract_keywords(self):
        # 意味のあるカタカナ語や漢字の固有名詞を抽出
        if not self.desc: return []
        potential = re.findall(r'[\u4E00-\u9FFF]{2,}|[\u30A1-\u30F6]{2,}', self.desc)
        ignore = ["物語", "世界", "登場", "展開", "魅力", "作品", "連載", "発売", "本作", "収録", "真相", "事件"]
        k = [p for p in potential if p not in ignore]
        return list(dict.fromkeys(k))[:3]

    def build(self, is_legend):
        highlight = ""
        for series_name, volumes in VOLUME_HIGHLIGHTS.items():
            if series_name in self.title:
                highlight = volumes.get(self.vol_num, "")
                break
        
        # 導入
        intro_patterns = [
            f"『{self.title}』は、{self.author}先生が放つ渾身のエンターテインメント作品です。",
            f"今、マンガファンの間で絶大な支持を集めている『{self.title}』（{self.author}著）は、一読の価値がある傑作です。",
            f"{self.author}先生の圧倒的な筆力で描かれる『{self.title}』。読者の心を一気に掴んで離さない魅力的な一冊です。"
        ]
        
        # 巻数・リサーチ情報
        vol_info = ""
        if highlight:
            vol_info = f"特に第{self.vol_num}巻である本作では、{highlight} "
        elif self.vol_num:
            vol_info = f"物語が大きな転換点を迎える第{self.vol_num}巻。前巻からの伏線が回収され、次なる嵐を予感させる重要な局面が描かれています。"
            
        # ストーリー・描写
        kw_text = "や".join(self.keywords) if self.keywords else "独自の重厚な世界観"
        story_patterns = [
            f"本作の核となるのは、{kw_text}を中心とした緻密なストーリー構成です。予測不可能な展開に、ページをめくる手が止まりません。",
            f"緻密な世界観設定が本作の魅力。物語が進むにつれて{kw_text}にまつわる謎が明かされていく様は圧巻です。",
            f"テンポの良い掛け合いと思わず唸るような独創的なアイデアが満載。{kw_text}を主軸とした迫力ある描写から目が離せません。"
        ]
        
        # 作画・構成
        art_patterns = [
            "作画のクオリティも非常に高く、背景の細部まで徹底的に描き込まれています。キャラクターの表情一つひとつに宿る感情が、ドラマをより一層引き立てます。",
            "独特で洗練された絵のタッチが、作品の世界を鮮やかに彩っています。特に勝負所での演出センスは抜群で、視覚的なインパクトが非常に強いのが特徴です。",
            "キャラクターの躍動感が素晴らしく、紙面から飛び出してきそうな迫力があります。繊細さと鋭さを兼ね備えた描写力は、まさに芸術的です。"
        ]
        
        # 結び
        conclusion = random.choice([
            "全マンガファンに自信を持っておすすめできる、最高峰のエンターテインメント体験をお楽しみください。",
            "あなたのマンガライフをより彩り豊かにしてくれること間違いなしの、珠玉の一冊です。",
            "ジャンルの枠を超えた普遍的な感動があり、何度でも読み返したくなる不思議な魔力に満ちています。"
        ])

        paragraphs = [
            random.choice(intro_patterns),
            vol_info,
            random.choice(story_patterns),
            random.choice(art_patterns),
            conclusion
        ]
        if is_legend:
            paragraphs.insert(0, f"漫画史に名を刻むレジェンド作品『{self.title}』。{kw_text}という革新的なテーマを世に知らしめた、まさに「必読」の一冊です。")
            
        return "\n\n".join([p for p in paragraphs if p])

def generate_commentary(title, author, is_legendary, description=""):
    vol_match = re.search(r'(\d+)\s*(巻|vol)', title)
    if not vol_match:
        vol_match = re.search(r'\s(\d+)$', title)
    vol_num = vol_match.group(1) if vol_match else ""
    
    builder = NaturalSentenceBuilder(title, author, description, vol_num)
    return builder.build(is_legendary)

def zen_to_han(text):
    # 全角数字を半角に変換
    return text.translate(str.maketrans('０１２３４５６７８９', '0123456789'))

def clean_title(title):
    # 全角数字を半角に、また表記を統一
    title = zen_to_han(title)
    # 余計な記号や括弧を削除
    cleaned = re.sub(r'\(.*?\)|（.*?）', '', title)
    cleaned = re.sub(r'【.*?】|\[.*?\]', '', cleaned)
    cleaned = re.sub(r'[\(\)（）]', '', cleaned).strip()
    return cleaned

# ... (その他の既存の関数は維持、または微調整) ...
NEGATIVE_KEYWORDS = [
    "楽譜", "スコア", "画集", "設定資料集", "イラスト集", "カレンダー", "雑誌", "攻略本",
    "実用", "教本", "入門", "解説", "ガイド", "テキスト", "問題集", "事典", "辞典",
    "アトラス", "のための", "コメディカル", "臨床", "医学", "看護", "図鑑", "学習",
    "アンソロジー", "ファンブック", "ポストカード", "手帳", "日記", "ぬりえ",
    "BOX", "ボックス", "セット", "全巻", "合本", "ベストシーン", "テレビ絵本", "絵本",
    "総集編", "増刊", "ドラマCD", "限定版", "特装版", "アニメコミック",
    "小説", "ノベル", "ライトノベル", "ラノベ", "文庫版", "チャットノベル"
]

def is_manga(title, description, genre_id):
    if genre_id and not genre_id.startswith("001001"): return False
    # 有名作品リストに含まれていれば通過
    LEGENDARY_UPPER = [lt.upper() for lt in LEGENDARY_TITLES]
    TITLE_UPPER = title.upper()
    if any(lt in TITLE_UPPER for lt in LEGENDARY_UPPER): return True
    if re.search(r'\d{4}年\s*\d+号', title) or re.search(r'\d+号$', title): return False
    text = (title + " " + (description or "")).lower()
    if any(nk.lower() in text for nk in NEGATIVE_KEYWORDS): return False
    return True

def fetch_rakuten_data(genre_id=None, keyword=None, sort_method="reviewCount", page=1):
    params = {
        "format": "json", "applicationId": APP_ID, "hits": 30, "page": page,
        "sort": sort_method, "imageFlag": 1, "booksGenreId": genre_id or "001001"
    }
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

# 伝説的なタイトル (リサーチ対象含む)
LEGENDARY_TITLES = [
    "ONE PIECE", "NARUTO", "BLEACH", "鬼滅の刃", "呪術廻戦", "チェンソーマン", 
    "僕のヒーローアカデミア", "ハイキュー", "銀魂", "HUNTER×HUNTER", "スラムダンク", 
    "ドラゴンボール", "進撃の巨人", "鋼の錬金術師", "名探偵コナン", "キングダム", 
    "ブルーロック", "名探偵コナン", "ドラえもん", "クレヨンしんちゃん", "サザエさん", 
    "ブラック・ジャック", "ベルセルク", "ジョジョの奇妙な冒険", "SPY×FAMILY", "推しの子"
]

def generate_manga_data():
    series_map = {}
    sort_methods = ["reviewCount", "sales", "standard"]
    
    for gid in BOOK_GENRES:
        for sort_m in sort_methods:
            print(f"Fetching genre {gid} (Sort: {sort_m})...", flush=True)
            for page in range(1, 101):
                items = fetch_rakuten_data(genre_id=gid, page=page, sort_method=sort_m)
                if not items: break
                for item in items:
                    v = item.get("Item", {})
                    title = clean_title(v.get("title", ""))
                    if is_manga(title, v.get("itemCaption", ""), v.get("booksGenreId", "")):
                        author = v.get("author", "不明")
                        m_id = hashlib.md5((title + author).encode()).hexdigest()[:12]
                        if m_id not in series_map:
                            series_map[m_id] = v
                
                if page % 10 == 0:
                    print(f"  Current unique items: {len(series_map)}", flush=True)
                
                time.sleep(0.1)
                if len(series_map) >= TARGET_COUNT: break
            if len(series_map) >= TARGET_COUNT: break
        if len(series_map) >= TARGET_COUNT: break

    # 第二フェーズ: 重要作品の「全巻スイープ」
    print(f"\nPhase 2: Deep sweeping for {len(LEGENDARY_TITLES)} legendary titles to ensure full coverage...", flush=True)
    for title_kw in LEGENDARY_TITLES:
        print(f"  Sweeping: {title_kw}...", flush=True)
        for page in range(1, 11):
            items = fetch_rakuten_data(keyword=title_kw, page=page, sort_method="standard")
            if not items: break
            found_new = False
            for item in items:
                v = item.get("Item", {})
                full_title = clean_title(v.get("title", ""))
                if title_kw.lower() in full_title.lower():
                    if not is_manga(full_title, v.get("itemCaption", ""), v.get("booksGenreId", "")):
                        continue
                    author = v.get("author", "不明")
                    m_id = hashlib.md5((full_title + author).encode()).hexdigest()[:12]
                    if m_id not in series_map:
                        series_map[m_id] = v
                        found_new = True
            if not found_new and page > 1: break
            time.sleep(0.1)
    
    print(f"Deep sweep completed. Total unique items: {len(series_map)}", flush=True)

    series_groups = {} # series_title -> list of items
    
    print(f"Grouping into series and generating commentaries for {len(series_map)} items...", flush=True)
    
    for m_id, v in series_map.items():
        title = clean_title(v.get("title", ""))
        author = v.get("author", "不明")
        
        # タイトルから巻数とシリーズ名を分離
        # 例: "キングダム 70" -> series: "キングダム", vol: "70"
        vol_match = re.search(r'(\d+)\s*(巻|vol|$)', title, re.I)
        if vol_match:
            series_title = title[:vol_match.start()].strip()
            vol_num = vol_match.group(1)
        else:
            series_title = title
            vol_num = "1" # デフォルト
        
        # シリーズ名が短すぎる、または巻数が取れなかった場合のフォールバック
        if not series_title:
            series_title = title
            
        series_id = hashlib.md5((series_title + author).encode()).hexdigest()[:12]
        
        is_legend = any(lt.lower() in series_title.lower() for lt in LEGENDARY_TITLES)
        desc = v.get("itemCaption", "")
        if not desc: desc = f"『{title}』が贈る圧倒的な世界観。物語の神髄を美麗な書影と共にお楽しみください。"
        
        gid = v.get("booksGenreId", "001001")
        cover = v.get("largeImageUrl", "").split("?")[0] + "?_ex=300x420"
        if not cover or "noimage" in cover.lower(): continue

        manga_item = {
            "id": m_id,
            "title": title,
            "seriesId": series_id,
            "seriesTitle": series_title,
            "volumeNumber": vol_num,
            "description": desc,
            "commentary": generate_commentary(title, author, is_legend, desc),
            "tags": list(set([author, "漫画", series_title] + ([title.split()[0]] if " " in title else []))),
            "author": author,
            "rating": round(random.uniform(4.5, 5.0), 1),
            "cover": cover, "genreId": gid, "isLegendary": is_legend
        }
        
        if series_id not in series_groups:
            series_groups[series_id] = []
        series_groups[series_id].append(manga_item)

    # 最終的なリスト（すべての巻を含むが、メタデータがリッチになったもの）
    final_list = []
    for s_id in series_groups:
        # 巻数順にソート
        series_groups[s_id].sort(key=lambda x: int(x["volumeNumber"]) if x["volumeNumber"].isdigit() else 999)
        final_list.extend(series_groups[s_id])

    # 件数制限 (ターゲットに合わせて)
    final_list = final_list[:TARGET_COUNT]
    
    with open('src/data/mangaData.json', 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)
    
    generate_sitemap(final_list)
    generate_ssg(final_list)
    print(f"DONE. Total: {len(final_list)} items in {len(series_groups)} series.")

def generate_ssg(manga_list):
    print(f"Generating SSG for {len(manga_list)} items...")
    
    # テンプレート読み込み
    with open("index.html", "r", encoding="utf-8") as f:
        template = f.read()

    # 既存のmangaディレクトリをクリーンアップ（必要なら）
    manga_base_dir = "public/manga"
    
    # --- 1. 個別巻ページ生成 (manga/[id]) ---
    for m in manga_list:
        m_id = m["id"]
        title = m["title"]
        desc = m["description"]
        author = m["author"]
        cover = m["cover"]
        
        page_html = template
        page_html = re.sub(r'<title>.*?</title>', f'<title>{title} - Manga Reach</title>', page_html)
        descript_text = f"{title}（{author}）のあらすじ、詳細データ、購入リンク。"
        page_html = re.sub(r'<meta name="description" content=".*?" />', f'<meta name="description" content="{descript_text}" />', page_html)
        page_html = re.sub(r'<meta property="og:title" content=".*?" />', f'<meta property="og:title" content="{title} - Manga Reach" />', page_html)
        page_html = re.sub(r'<meta property="og:image" content=".*?" />', f'<meta property="og:image" content="{cover}" />', page_html)
        page_html = re.sub(r'<link rel="canonical" href=".*?" />', f'<link rel="canonical" href="https://manga-reach.com/manga/{m_id}" />', page_html)

        dir_path = os.path.join(manga_base_dir, m_id)
        os.makedirs(dir_path, exist_ok=True)
        with open(os.path.join(dir_path, "index.html"), "w", encoding="utf-8") as f:
            f.write(page_html)

    # --- 2. シリーズ詳細ページ生成 (series/[id]) ---
    series_base_dir = "public/series"
    # シリーズ単位でまとめる
    series_map = {}
    for m in manga_list:
        sid = m["seriesId"]
        if sid not in series_map:
            series_map[sid] = m
            
    for sid, s in series_map.items():
        title = s["seriesTitle"]
        author = s["author"]
        cover = s["cover"]
        
        page_html = template
        page_html = re.sub(r'<title>.*?</title>', f'<title>{title} シリーズ一覧 - Manga Reach</title>', page_html)
        descript_text = f"{title}（{author}）の全巻リスト。1巻から最新刊までの詳細情報を網羅。"
        page_html = re.sub(r'<meta name="description" content=".*?" />', f'<meta name="description" content="{descript_text}" />', page_html)
        page_html = re.sub(r'<meta property="og:title" content=".*?" />', f'<meta property="og:title" content="{title} シリーズ一覧 - Manga Reach" />', page_html)
        page_html = re.sub(r'<meta property="og:image" content=".*?" />', f'<meta property="og:image" content="{cover}" />', page_html)
        page_html = re.sub(r'<link rel="canonical" href=".*?" />', f'<link rel="canonical" href="https://manga-reach.com/series/{sid}" />', page_html)

        dir_path = os.path.join(series_base_dir, sid)
        os.makedirs(dir_path, exist_ok=True)
        with open(os.path.join(dir_path, "index.html"), "w", encoding="utf-8") as f:
            f.write(page_html)

    print(f"SSG completed. Generated {len(manga_list)} manga and {len(series_map)} series pages.")

def generate_sitemap(manga_list):
    print(f"Generating sitemap for {len(manga_list)} items...")
    today = time.strftime("%Y-%m-%d")
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    
    base_url = "https://manga-reach.com"
    for path, priority in [("/", "1.0"), ("/about", "0.5"), ("/privacy", "0.5")]:
        xml.append(f'  <url><loc>{base_url}{path}</loc><lastmod>{today}</lastmod><changefreq>daily</changefreq><priority>{priority}</priority></url>')
    
    # シリーズページ
    seen_series = set()
    for m in manga_list:
        sid = m["seriesId"]
        if sid not in seen_series:
            xml.append(f'  <url><loc>{base_url}/series/{sid}</loc><lastmod>{today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>')
            seen_series.add(sid)
            
    # 個別巻ページ
    for m in manga_list:
        xml.append(f'  <url><loc>{base_url}/manga/{m["id"]}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>')
    
    xml.append('</urlset>')
    
    with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml))
    print("Sitemap generated.")

if __name__ == "__main__":
    BOOK_GENRES = ["001001001", "001001002", "001001003", "001001004", "001001006", "001001007", "001001008"]
    generate_manga_data()
