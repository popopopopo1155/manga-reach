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

  useEffect(() => {
    console.log("Manga Reach: Data Loaded.", mangaData.length, "items");
    if (!query) {
      setResults(mangaData.slice(0, 16));
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
        <section className="search-section">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="作品名、著者、ジャンルで検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </section>

        <section className="results-section">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', opacity: 0.8 }}>
            {query ? `「${query}」の検索結果 (${results.length}件)` : "おすすめの作品"}
          </h2>
          <div className="manga-grid">
            <AnimatePresence mode="popLayout">
              {results.map((manga) => (
                <motion.article
                  key={manga.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="manga-card"
                >
                  <div className="manga-cover-wrapper">
                    {manga.cover ? (
                      <img
                        src={manga.cover}
                        alt={`${manga.title}の表紙`}
                        className="manga-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="manga-cover-placeholder">
                        <span>No Image</span>
                      </div>
                    )}
                    <div className="manga-rating">
                      <Star size={14} fill="currentColor" />
                      <span>{manga.rating}</span>
                    </div>
                  </div>

                  <div className="manga-info">
                    <h3 className="manga-title">{manga.title}</h3>
                    <p className="manga-author">{manga.author}</p>
                    <p className="manga-description">
                      {manga.description.length > 80
                        ? manga.description.substring(0, 80) + "..."
                        : manga.description}
                    </p>
                    <div className="manga-tags">
                      {manga.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>

                    {manga.isReal && (
                      <div className="affiliate-links">
                        <a
                          href={getAmazonLink(manga.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aff-btn amazon"
                        >
                          Amazonで探す
                        </a>
                        <a
                          href={getRakutenLink(manga.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aff-btn rakuten"
                        >
                          楽天で探す
                        </a>
                      </div>
                    )}
                  </div>
                </motion.article>
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
