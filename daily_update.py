import json
import random
import time
import os
import hashlib
from generate_data import fetch_rakuten_data, clean_title, is_manga, generate_commentary, extract_tags

DATA_FILE = 'src/data/mangaData.json'

def daily_update():
    print("Starting daily content update...")
    
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return

    # 1. 既存のデータを読み込む
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        manga_data = json.load(f)
    
    existing_ids = {m['id'] for m in manga_data}
    existing_titles = {m['title'] for m in manga_data}

    # 2. 楽天APIから「漫画」を検索（人気順）
    # ランダムなジャンルから1ページ目を取得して新しいのを探す
    BOOK_GENRES = ["001001001", "001001002", "001001003", "001001004", "001001006", "001001007", "001001008"]
    random.shuffle(BOOK_GENRES)
    
    new_manga = None
    
    for gid in BOOK_GENRES:
        print(f"Searching in genre {gid}...")
        # 3ページ目くらいまで見てみる（1ページ目はすでにある可能性が高いので）
        for p in range(1, 10):
            items = fetch_rakuten_data(genre_id=gid, page=p, sort_method="reviewCount")
            if not items:
                break
                
            for item in items:
                m = item.get("Item", {})
                title = clean_title(m.get("title", ""))
                
                # まだサイトにない漫画を見つける
                if is_manga(title, m.get("itemCaption", ""), m.get("booksGenreId", "")):
                    author = m.get("author", "不明")
                    m_id = hashlib.md5((title + author).encode()).hexdigest()[:12]
                    
                    if m_id not in existing_ids and title not in existing_titles:
                        # 新規漫画確定
                        desc = m.get("itemCaption", "")
                        if not desc:
                            desc = f"「{title}」の圧倒的な世界観。注目の最新作をチェックしましょう。"
                        
                        image_url = m.get("largeImageUrl", "").split("?")[0] + "?_ex=300x420"
                        
                        new_manga = {
                            "id": m_id,
                            "title": title,
                            "description": desc,
                            "commentary": generate_commentary(title, author, False, desc),
                            "tags": extract_tags(title, desc, author, gid),
                            "author": author,
                            "rating": round(random.uniform(4.4, 4.9), 1),
                            "cover": image_url,
                            "genreId": gid,
                            "isLegendary": False
                        }
                        break
            if new_manga: break
        if new_manga: break

    if new_manga:
        print(f"Adding new manga: {new_manga['title']}")
        manga_data.append(new_manga)
        
        # 3. 保存
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(manga_data, f, ensure_ascii=False, indent=2)
        
        print("Successfully updated mangaData.json")
        
        # 4. サイトマップの再生成
        from generate_sitemap import generate_sitemap
        generate_sitemap()
        print("Successfully regenerated sitemap.xml")
    else:
        print("No new manga found today.")

if __name__ == "__main__":
    daily_update()
