import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, Star, ExternalLink, ShoppingCart, Info, ShieldCheck, Mail, ArrowLeft, Smartphone, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mangaData from './data/mangaData.json';
import { PrivacyPolicy, About } from './components/LegalPages';

const RAKUTEN_AFFILIATE_ID = "5025407c.d8994699.5025407d.e9a413e7";
const AMAZON_ASSOCIATE_ID = "mangaanimeosu-22";

// 共通のカードコンポーネント (究極覚醒・100%全開仕様)
const MangaCard = ({ manga, index }) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.5, delay: index ? (index % 12) * 0.04 : 0 }}
    className="manga-card"
  >
    <div className="cover-container">
      {manga.cover ? (
        <img
          src={manga.cover}
          alt={`${manga.title} - ${manga.author}作品の最高解像度カバー`}
          className="manga-cover"
          loading="lazy"
        />
      ) : (
        <div className="manga-cover-placeholder">
          <span>画像検索中...</span>
        </div>
      )}
      <div className="rating-overlay" aria-label={`読者評価: ${manga.rating}`}>
        <Star size={12} fill="#fbbf24" stroke="none" />
        {manga.rating}
      </div>
    </div>

    <div className="card-content">
      <h3 className="manga-title" title={manga.title}>{manga.title}</h3>
      <p className="manga-author">{manga.author}</p>

      {manga.isReal && (
        <div className="affiliate-section" role="group" aria-label="購入オプション">
          <div className="link-group-label" data-label="electronic">
            <Smartphone size={10} style={{ marginRight: '4px' }} />
            電子書籍で読む
          </div>
          <div className="affiliate-grid">
            <a
              href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(manga.title + " Kindle版")}&tag=${AMAZON_ASSOCIATE_ID}&rh=n%3A2250762051`}
              target="_blank"
              rel="noopener noreferrer"
              className="mini-btn btn-kindle"
              title={`${manga.title} Kindle版`}
            >
              Kindle
            </a>
            <a
              href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(manga.title)}/101227/?affiliateId=${RAKUTEN_AFFILIATE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mini-btn btn-kobo"
              title={`${manga.title} 楽天Kobo`}
            >
              Kobo
            </a>
          </div>

          <div className="link-group-label" data-label="physical">
            <Book size={10} style={{ marginRight: '4px' }} />
            紙の本を買う
          </div>
          <div className="affiliate-grid">
            <a
              href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(manga.title + " 漫画")}&tag=${AMAZON_ASSOCIATE_ID}&rh=n%3A466280`}
              target="_blank"
              rel="noopener noreferrer"
              className="mini-btn btn-amazon"
              title={`${manga.title} Amazon (紙)`}
            >
              Amazon
            </a>
            <a
              href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(manga.title)}/200162/?affiliateId=${RAKUTEN_AFFILIATE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mini-btn btn-rakuten"
              title={`${manga.title} 楽天 (紙)`}
            >
              楽天
            </a>
          </div>
        </div>
      )}
    </div>
  </motion.article>
);

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');

  const fuse = useMemo(() => new Fuse(mangaData, {
    keys: ['title', 'author', 'description', 'tags'],
    threshold: 0.35,
    distance: 100,
  }), []);

  useEffect(() => {
    if (!query) {
      setResults(mangaData.slice(0, 48));
      return;
    }
    const filtered = fuse.search(query).map(r => r.item);
    setResults(filtered);
  }, [query, fuse]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (currentPage === 'privacy') {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <button className="mini-btn" onClick={() => handlePageChange('home')} style={{ marginBottom: '2rem', width: 'auto' }}>
          <ArrowLeft size={16} /> 戻る
        </button>
        <PrivacyPolicy />
      </div>
    );
  }

  if (currentPage === 'about') {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <button className="mini-btn" onClick={() => handlePageChange('home')} style={{ marginBottom: '2rem', width: 'auto' }}>
          <ArrowLeft size={16} /> 戻る
        </button>
        <About />
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <div className="logo-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Manga Reach</h1>
            <p className="subtitle">1万件の最高画質データから、あなたにぴったりの運命の一冊を瞬時に。</p>
          </motion.div>
        </div>

        <div className="search-wrapper">
          <Search className="search-icon" size={24} />
          <input
            type="text"
            className="search-bar"
            placeholder="作品名、著者名、キーワードで検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </header>

      <main>
        <div className="manga-grid">
          <AnimatePresence mode="popLayout">
            {results.map((manga, idx) => (
              <MangaCard key={manga.id} manga={manga} index={idx} />
            ))}
          </AnimatePresence>
        </div>

        {results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <p style={{ fontSize: '1.2rem' }}>見つかりませんでした。別のキーワードをお試しください。</p>
          </div>
        )}
      </main>

      <footer>
        <nav className="footer-nav">
          <span className="footer-link" onClick={() => handlePageChange('home')}>HOME</span>
          <span className="footer-link" onClick={() => handlePageChange('about')}>ABOUT</span>
          <span className="footer-link" onClick={() => handlePageChange('privacy')}>PRIVACY</span>
        </nav>
        <div className="trust-badge">
          <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          <span>当サイトは各ショップと提携し、信頼できる正規のリンクのみを提供しています。</span>
        </div>
        <p className="copyright" style={{ marginTop: '2rem' }}>© 2026 Manga Reach. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
