import json
from datetime import datetime
import os
import urllib.parse

def generate_sitemap():
    # データ読み込み
    data_path = 'src/data/mangaData.json'
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    with open(data_path, 'r', encoding='utf-8') as f:
        manga_list = json.load(f)

    base_url = "https://manga-reach.com"
    today = datetime.now().strftime('%Y-%m-%d')

    # XMLヘッダー
    sitemap_content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # トップページ
    sitemap_content.append(f'  <url><loc>{base_url}/</loc><lastmod>{today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>')
    sitemap_content.append(f'  <url><loc>{base_url}/about</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>')
    sitemap_content.append(f'  <url><loc>{base_url}/privacy</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>')

    # 各個別作品ページ
    print(f"Generating entries for {len(manga_list)} manga...")
    tags = set()
    for manga in manga_list:
        m_id = manga.get('id')
        if m_id:
            url = f"{base_url}/manga/{m_id}"
            sitemap_content.append(f'  <url><loc>{url}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>')
        # タグを収集
        for t in manga.get('tags', []):
            if t: tags.add(t)

    # 各タグページ (SEO特化)
    print(f"Generating entries for {len(tags)} tags...")
    for tag in tags:
        url = f"{base_url}/tag/{urllib.parse.quote(tag)}"
        sitemap_content.append(f'  <url><loc>{url}</loc><lastmod>{today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>')

    # XMLフッター
    sitemap_content.append('</urlset>')

    # 書き出し
    output_path = 'public/sitemap.xml'
    #ヘッダーとフッターを除いた実URL数
    url_count = len([line for line in sitemap_content if '<url>' in line])
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sitemap_content))

    print(f"DONE: Sitemap generated with {url_count} URLs at {output_path}")

if __name__ == "__main__":
    generate_sitemap()
