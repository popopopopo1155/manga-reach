import json
import random
import urllib.request
import time
import urllib.parse
import re
import hashlib

import os

# 楽天API設定 (環境変数から取得、ローカル実行時はデフォルト値を使用)
APP_ID = os.environ.get("RAKUTEN_APP_ID", "1016939452195557224")
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
    "ベルセルク", "20世紀少年", "MONSTER", "バガボンド", "ROOKIES", "金色のッシュ!!", "封神演義", "るろうに剣心",
    "あしたのジョー", "ガラスの仮面", "デビルマン", "銀河鉄道999", "巨人の星", "ゴルゴ13",
    "踏んだり、蹴ったり、愛したり", "正反対な君と僕", "姉のともだち", "悪役令嬢たちは揺るがない",
    "高度に発達した医学は魔法と区別がつかない", "魔女と傭兵", "異世界刀匠の魔剣製作ぐらし",
    "となりの席のヤツがそういう目で見てくる", "誰か夢だと言ってくれ", "変な家", "恋する(おとめ)の作り方", "薫る花は凛と咲く"
]

def generate_commentary(title, author, is_legendary, description=""):
    # あらすじからキーワードを抽出（簡易的だが効果的）
    keywords = []
    if description:
        # 3文字以上の漢字・カタカナの連続をキーワード候補とする
        potential = re.findall(r'[\u4E00-\u9FFF]{2,}|[\u30A1-\u30F6]{2,}', description)
        keywords = [k for k in potential if k not in ["物語", "世界", "登場", "展開", "魅力", "作品", "連載", "発売", "本作"]]
        keywords = list(dict.fromkeys(keywords))[:5] # 重複除去して最大5つ

    keyword_text = "、".join(keywords) if keywords else "独自の重厚な世界観"
    
    # 巻数情報の抽出
    vol_match = re.search(r'(\d+)\s*(巻|vol)', title)
    if not vol_match:
        vol_match = re.search(r'\s(\d+)$', title) # "ONE PIECE 100" 形式
        
    vol_context = ""
    if vol_match:
        vol_num = vol_match.group(1)
        if vol_num == "1":
            vol_context = "記念すべき第1巻として、壮大な物語の幕開けを鮮烈に描く本作は、"
        else:
            vol_context = f"物語が大きな転換点を迎える第{vol_num}巻。物語の核心に迫る展開が続き、"

    intros = [
        f"『{title}』は、{author}先生が放つ珠玉のエンターテインメント作品です。{vol_context}{keyword_text}に焦点を当てた緻密な描写は、読者の期待を良い意味で裏切り続けます。",
        f"今、マンガ好きの間で話題沸騰中の『{title}』（{author}著）は、{vol_context}{keyword_text}を巡る熱いドラマが展開されます。一読の価値がある傑作です。",
        f"読者の心に深く突き刺さる『{title}』。{vol_context}{author}先生の圧倒的な表現力によって描かれる{keyword_text}の物語は、読む者に強烈な印象を残します。"
    ]
    
    story_aspects = [
        f"本作の最大の魅力は、{keyword_text}を中心に据えた重厚なストーリー構成にあります。予測不可能な展開の連続に、ページをめくる手が止まりません。特に今巻におけるキャラクター同士の葛藤や成長は、これまで以上に鮮明に描かれています。",
        f"緻密な世界観設定と魅力的なキャラクター造形が本作の肝です。物語が進むにつれて{keyword_text}の秘密が明かされていく様には驚きを隠せません。単なる娯楽の枠を超えた、深いメッセージ性が込められています。",
        f"テンポの良い掛け合いと思わず唸るような独創的なアイデアが満載です。{keyword_text}を主軸としたエピソードが目白押し。次の一手が全く読めない、スリリングな体験を約束します。"
    ]
    
    art_styles = [
        "作画の美しさも特筆すべき点です。細部まで徹底的に描き込まれた背景や、キャラクターの表情一つひとつに宿る繊細な感情は、まさに芸術の域に達しています。静止画でありながら、まるでキャラクターが画面の中で動き出しそうな躍動感溢れる描写に圧倒されます。光と影のコントラストや、独特のカラーリングも作品の独特な雰囲気を際立たせています。",
        "独特でスタイリッシュな絵のタッチが、作品の世界をより鮮やかに、そして深く彩っています。コマ割りや演出のセンスが抜群で、視覚的なインパクトが非常に強いのが特徴です。特にここぞという場面での大ゴマや、スピード感溢れるアクションシーンの描写は、息を呑むほどの迫力と説得力を兼ね備えています。ページをめくる速度が、自然と作品のテンポと同期していくような感覚を味わえます。",
        "温かみのある柔らかい線画と、それでいて時折見せる鋭利な感性を感じさせるタッチが印象的です。キャラクターの立ち居振る舞いや、細かな仕草の一つひとつが丁寧に描かれており、ドラマチックなシーンをより一層ドラマチックに演出しています。背景一つとっても、その場の空気感や温度まで伝わってくるような高い描写力は、本作が多くの読者を惹きつける大きな要因の一つでしょう。"
    ]
    
    targets = [
        "特に、日常の喧騒を忘れて何かに熱中したい方や、深い人間ドマをじっくり味わいたい方には、これ以上ないほどおすすめの一冊です。一度読み始めると、その中毒性の高さに驚くはずです。普段あまりマンガを読まない層から、毎日数十作品をチェックするようなコアなファンまで、幅広く楽しめる懐の深さがあります。",
        "新しい視点で世界を見つめ直したい方や、失いかけた熱い情熱を再び感じたい読者層に、ぜひ強くプッシュしたい傑作です。思春期の揺れ動く繊細な感情から、大人が抱える複雑な苦悩までを幅広く、かつ深くカバーしています。読む人の年齢や立場によって、異なる感動や気づきを与えてくれる、非常に稀有な作品と言えるでしょう。",
        "既存のジャンルの枠に囚われない、自由で大胆な発想のマンガを求めている方に最適です。ライトな層から玄人のマンガ愛好家まで、どんな読者であっても確実に満足できる圧倒的なクオリティを誇っています。友人や家族、大切な人へのプレゼントとしても自信を持って選べる、そんな普遍的な魅力に満ち溢れています。"
    ]
    
    conclusions = [
        f"結論として、この『{title}』は、現代のマンガシーンにおいて絶対に外せない、時代を定義する一冊と言えます。{author}先生が切り拓く新しい表現の地平を、ぜひあなた自身の目で確かめてみてください。読了後、あなたの本棚の特等席を占めることになるはずです。",
        f"全世代のマンガファンに、自信を持って推薦できる傑作中の傑作です。読み終わった後に訪れる清々しい充足感と、心に静かに残る深い余韻は、他の作品ではなかなか味わえません。今すぐ手に取って、その唯一無二の物語体験に身を委ねてみてください。後悔はさせません。",
        f"『{title}』は、マンガというメディアが持つ可能性を最大限に引き出した、奇跡のような作品です。{author}先生の圧倒的な才能と、今後のさらなる飛躍からも目が離せません。あなたの人生、そしてマンガライフをより彩り豊かにしてくれること間違いなしの一冊です。"
    ]

    if is_legendary:
        legend_pre = [
            f"もはや説明不要、漫画史における「神話」とも言えるのがこの『{title}』です。{keyword_text}という革新的なテーマを世に知らしめた本作は、まさに不朽の名作に相応しい存在感を放っています。",
            f"全マンガ読者の必修科目と言っても過言ではない、至高のレジェンド作品『{title}』。{keyword_text}を巡る伝説的な描写は、今なお色褪せることなく輝き続けています。"
        ]
        return random.choice(legend_pre) + "\n\n" + random.choice(intros) + "\n\n" + random.choice(story_aspects) + "\n\n" + random.choice(art_styles) + "\n\n" + random.choice(targets) + "\n\n" + random.choice(conclusions) + "\n\n" + "まさに漫画という文化そのものを体現している傑作です。"

    return random.choice(intros) + "\n\n" + random.choice(story_aspects) + "\n\n" + random.choice(art_styles) + "\n\n" + random.choice(targets) + "\n\n" + random.choice(conclusions)

def clean_title(title):
    # 余計な記号や括弧を削除するのみ。巻数は保持する（各巻を独立したページにするため）
    cleaned = re.sub(r'\(.*?\)|（.*?）', '', title)
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
    full_text = title + " " + (description or "")
    for k, v in kw_map.items():
        if k in full_text: tags.add(v)
    return list(tags)

def generate_manga_data():
    series_map = {}
    
    for lt in LEGENDARY_TITLES:
        items = fetch_rakuten_data(keyword=lt)
        for item in items:
            m = item.get("Item", {})
            bt = clean_title(m.get("title", ""))
            if lt.lower() in bt.lower() and is_manga(bt, m.get("itemCaption", ""), m.get("booksGenreId", "")):
                if bt not in series_map: series_map[bt] = []
                series_map[bt].append(m)
                break

    for gid in BOOK_GENRES:
        print(f"Fetching genre {gid}...", flush=True)
        for p in range(1, 40):
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
    for full_title, volumes in series_map.items():
        is_legend = any(lt.lower() in full_title.lower() for lt in LEGENDARY_TITLES)
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
        if not desc: desc = f"『{full_title}』が贈る圧倒的な世界観。不朽の名作を美麗な書影とお楽しみください。"
        
        gid = bi.get("booksGenreId", "001001")
        author = bi.get("author", "不明")
        
        final_list.append({
            "id": hashlib.md5((full_title + author).encode()).hexdigest()[:12],
            "title": full_title, "description": desc,
            "commentary": generate_commentary(full_title, author, is_legend, desc),
            "tags": extract_tags(full_title, desc, author, gid),
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
    with open('src/data/mangaData.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"DONE. Total: {len(data)}", flush=True)
