import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mangaData from './data/mangaData.json';

const RAKUTEN_AFFILIATE_ID = "5025407c.d8994699.5025407d.e9a413e7";
const AMAZON_ASSOCIATE_ID = "mangaanimeosu-22";

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Fuse.js options
  const fuseOptions = {
    keys: ['title', 'tags', 'description'],
    threshold: 0.35,
    distance: 100,
    ignoreLocation: true,
  };

  const fuse = useMemo(() => new Fuse(mangaData, fuseOptions), []);

  // SEO/Curation logic: Extract meaningful subsets
  const featured = useMemo(() => {
    const sorted = [...mangaData].sort((a, b) => b.rating - a.rating);
    return {
      trending: mangaData.slice(20, 28), // Recent/Active ones
      hallOfFame: sorted.slice(0, 8),     // Top rated
      fantasy: mangaData.filter(m => m.tags.includes('ファンタジー')).slice(0, 8)
    };
  }, []);

  useEffect(() => {
    console.log("Manga Reach: Data Loaded.", mangaData.length, "items");
    if (!query) {
      setResults(mangaData.slice(0, 20));
      return;
    }

    const searchResults = fuse.search(query);
    setResults(searchResults.map(result => result.item).slice(0, 40));
  }, [query, fuse]);

  // アフィリエイトリンクの最適化（漫画カテゴリを指定）
  const getAmazonLink = (title) => {
    // rh=n:466280 は「本 > コミック・ラノベ・BL」のカテゴリID
    return `https://www.amazon.co.jp/s?k=${encodeURIComponent(title + " 漫画")}&tag=${AMAZON_ASSOCIATE_ID}&rh=n%3A466280`;
  };

  const getRakutenLink = (title) => {
    // 200162 は「本・雑誌・コミック」のジャンルID
    return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(title)}/200162/?affiliateId=${RAKUTEN_AFFILIATE_ID}`;
  };

  return (
    <div className="container">
      <header>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Manga Reach（マンガ・リーチ）
        </motion.h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
          10,000件以上のデータから、あなたにぴったりの一冊を。
        </p>

        <div className="search-box">
          <Search className="search-icon" size={24} />
          <input
            type="text"
            className="search-input"
            placeholder="海賊、巨人、魔法、アクション..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="container">
        {!query && (
          <div className="curation-sections">
            <section className="featured-group">
              <div className="section-header">
                <h2>🔥 今週のトレンド作品</h2>
                <p>Manga Reachが今注目する、話題の作品をピックアップ</p>
              </div>
              <div className="manga-grid">
                {featured.trending.map((manga) => (
                  <MangaCard key={`trend-${manga.id}`} manga={manga} />
                ))}
              </div>
            </section>

            <section className="featured-group" style={{ marginTop: '4rem' }}>
              <div className="section-header">
                <h2>🏆 不朽の殿堂入り名作</h2>
                <p>評価が高く、世代を超えて愛され続ける傑作たち</p>
              </div>
              <div className="manga-grid">
                {featured.hallOfFame.map((manga) => (
                  <MangaCard key={`hof-${manga.id}`} manga={manga} />
                ))}
              </div>
            </section>

            <section className="featured-group" style={{ marginTop: '4rem' }}>
              <div className="section-header">
                <h2>✨ 人気のファンタジー作品</h2>
                <p>圧倒的な世界観に浸れる、珠玉のファンタジーマンガ</p>
              </div>
              <div className="manga-grid">
                {featured.fantasy.map((manga) => (
                  <MangaCard key={`fan-${manga.id}`} manga={manga} />
                ))}
              </div>
            </section>

            <div className="seo-text-block">
              <h3>10,000作品から見つかる、究極のマンガ発見体験</h3>
              <p>
                Manga Reachは、実在するマンガ1万作品以上のデータベースから、あなたの「読みたい」を瞬時に引き出します。
                アクション、ファンタジー、恋愛、サスペンスなど、あらゆるジャンルを網羅。最新の書影とあらすじを確認し、
                Amazonや楽天でスムーズにチェックできます。
              </p>
            </div>
          </div>
        )}

        <section className="results-section" style={{ marginTop: !query ? '4rem' : '0' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', opacity: 0.8 }}>
            {query ? `「${query}」の検索結果 (${results.length}件)` : "🔍 全作品から探す"}
          </h2>
          <div className="manga-grid">
            <AnimatePresence mode="popLayout">
              {results.map((manga, index) => (
                <MangaCard key={`search-${manga.id}`} manga={manga} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 Manga Reach（マンガ・リーチ）. 全著作権所有.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '1.5rem', opacity: 0.7 }}>
          当サイトは、Amazon.co.jpアソシエイトおよび楽天アフィリエイト・プログラムの参加者です。<br />
          リンク先の価格や在庫状況については、遷移先の各ショップにてご確認ください。
        </p>
      </footer>
    </div>
  );
}

export default App;
