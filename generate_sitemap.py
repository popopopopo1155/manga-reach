import json
import os
from datetime import datetime

# 設定
BASE_URL = "https://manga-reach.com"
DATA_FILE = "src/data/mangaData.json"
SITEMAP_FILE = "public/sitemap.xml"

def generate_sitemap():
    print(f"Generating sitemap from {DATA_FILE}...")
    
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    today = datetime.now().strftime("%Y-%m-%d")
    
    urls = []
    
    # 1. 静的ページ
    urls.append({"loc": f"{BASE_URL}/", "lastmod": today, "changefreq": "daily", "priority": "1.0"})
    urls.append({"loc": f"{BASE_URL}/about", "lastmod": today, "changefreq": "monthly", "priority": "0.5"})
    urls.append({"loc": f"{BASE_URL}/privacy", "lastmod": today, "changefreq": "monthly", "priority": "0.5"})
    
    # 2. 漫画詳細ページ
    for manga in data:
        m_id = manga.get("id")
        if m_id:
            urls.append({
                "loc": f"{BASE_URL}/manga/{m_id}",
                "lastmod": today,
                "changefreq": "weekly",
                "priority": "0.8"
            })
            
    # 3. タグページ (ユニークなタグを抽出)
    all_tags = set()
    for manga in data:
        tags = manga.get("tags", [])
        for tag in tags:
            if tag:
                all_tags.add(tag)
    
    for tag in sorted(list(all_tags)):
        urls.append({
            "loc": f"{BASE_URL}/tag/{tag}",
            "lastmod": today,
            "changefreq": "weekly",
            "priority": "0.6"
        })

    # XML生成
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    for url in urls:
        line = f'  <url><loc>{url["loc"]}</loc><lastmod>{url["lastmod"]}</lastmod><changefreq>{url["changefreq"]}</changefreq><priority>{url["priority"]}</priority></url>'
        xml_lines.append(line)
        
    xml_lines.append('</urlset>')
    
    with open(SITEMAP_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines))
        
    print(f"DONE: Sitemap generated with {len(urls)} URLs at {SITEMAP_FILE}")

if __name__ == "__main__":
    generate_sitemap()
