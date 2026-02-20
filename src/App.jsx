import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Search, Star, ExternalLink, ShoppingCart, Info, ShieldCheck, Mail, ArrowLeft, Smartphone, Book, Share2, Heart, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mangaData from './data/mangaData.json';
import { PrivacyPolicy, About } from './components/LegalPages';

const RAKUTEN_AFFILIATE_ID = "5025407c.d8994699.5025407d.e9a413e7";
const AMAZON_ASSOCIATE_ID = "mangaanimeosu-22";

// 共通のカードコンポーネント (リンク化)
const MangaCard = ({ manga, index }) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.5, delay: index ? (index % 12) * 0.04 : 0 }}
    className="manga-card"
  >
    <Link to={`/manga/${manga.id}`} className="card-link-wrapper">
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
        <div className="card-footer-info">
          <span className="info-badge">
            <Info size={14} /> 詳細を見る
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
);

// タグ別一覧ページ
const TagPage = () => {
  const { tagName } = useParams();
  const navigate = useNavigate();

  const filteredManga = useMemo(() => {
    return mangaData.filter(m => m.tags?.includes(tagName)).sort((a, b) => b.rating - a.rating);
  }, [tagName]);

  useEffect(() => {
    document.title = `${tagName}のおすすめ漫画ランキング - Manga Reach`;
    const updateMeta = (selector, content) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };
    const descript = `${tagName}タグの付いた人気漫画をランキング形式で紹介。${filteredManga.slice(0, 3).map(m => m.title).join('、')}など、最高品質のデータから運命の一冊を探そう。`;
    updateMeta('meta[name="description"]', descript);
    updateMeta('meta[property="og:title"]', `${tagName} のおすすめ漫画ランキング - Manga Reach`);
    updateMeta('meta[property="og:description"]', descript);
    window.scrollTo(0, 0);
  }, [tagName, filteredManga]);

  return (
    <div className="container pt-layout">
      <div className="tag-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> ホームに戻る
        </button>
        <h1 className="tag-page-title">
          <span className="hash">#</span>{tagName} <span className="count">({filteredManga.length}作品)</span>
        </h1>
        <p className="tag-page-subtitle">「{tagName}」に関連する最高評価の作品を厳選しました。</p>
      </div>

      <main>
        <div className="manga-grid">
          <AnimatePresence mode="popLayout">
            {filteredManga.map((manga, idx) => (
              <MangaCard key={manga.id} manga={manga} index={idx} />
            ))}
          </AnimatePresence>
        </div>
        {filteredManga.length === 0 && (
          <div className="no-results">
            <p>このタグに一致する作品は見つかりませんでした。</p>
          </div>
        )}
      </main>
    </div>
  );
};

// 作品詳細ページコンポーネント (タグをクリック可能に修正)
const MangaDetail = ({ toggleFavorite, isFavorite, addToHistory }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const manga = useMemo(() => mangaData.find(m => m.id.toString() === id), [id]);

  useEffect(() => {
    if (id) addToHistory(id);
  }, [id, addToHistory]);

  const relatedManga = useMemo(() => {
    if (!manga) return [];
    return mangaData
      .filter(m => m.id !== manga.id)
      .map(m => {
        let score = 0;
        // 著者が同じなら大幅加点
        if (m.author === manga.author) score += 10;
        // 共通タグ1つにつき加点
        const commonTags = m.tags?.filter(t => manga.tags?.includes(t)) || [];
        score += commonTags.length * 3;
        // レーティングも加味 (人気順)
        score += m.rating * 0.5;
        return { item: m, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(entry => entry.item);
  }, [manga]);

  useEffect(() => {
    if (manga) {
      document.title = `${manga.title} - Manga Reach (マンガ・リーチ) | 究極のマンガ検索`;

      // メタタグを動的に更新
      const updateMeta = (selector, content) => {
        const el = document.querySelector(selector);
        if (el) el.setAttribute('content', content);
      };

      const descript = `${manga.title}（${manga.author}）のあらすじ、評価、レビューをチェック。KindleやKoboなどの電子書籍から紙の本まで、最安値・最新情報を網羅。`;

      updateMeta('meta[name="description"]', descript);
      updateMeta('meta[property="og:title"]', `${manga.title} - Manga Reach`);
      updateMeta('meta[property="og:description"]', descript);
      updateMeta('meta[property="og:image"]', manga.cover);
      updateMeta('meta[property="twitter:title"]', `${manga.title} - Manga Reach`);
      updateMeta('meta[property="twitter:description"]', descript);
      updateMeta('meta[property="twitter:image"]', manga.cover);
    }
    window.scrollTo(0, 0);
  }, [id, manga]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${manga.title} - Manga Reach`,
        text: `マンガ・リーチで「${manga.title}」をチェック！1万件のデータから運命の一冊が見つかる。`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('URLをコピーしました！SNSでシェアしてください。');
    }
  };

  if (!manga) return (
    <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
      <h2>作品が見つかりませんでした</h2>
      <button className="mini-btn btn-primary" onClick={() => navigate('/')}>ホームに戻る</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container detail-container"
    >
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> 作品一覧に戻る
      </button>

      <div className="detail-layout">
        <div className="detail-sidebar">
          <motion.div
            layoutId={`manga-img-${manga.id}`}
            className="detail-cover-wrapper"
          >
            <img src={manga.cover} alt={manga.title} className="detail-cover" />
            <div className="detail-rating">
              <Star size={16} fill="#fbbf24" stroke="none" />
              <span>{manga.rating} / 5.0</span>
            </div>
          </motion.div>
        </div>

        <div className="detail-main">
          <div className="detail-title-row">
            <h1 className="detail-title">{manga.title}</h1>
            <div className="detail-actions">
              <button
                onClick={() => toggleFavorite(manga.id.toString())}
                className={`favorite-btn ${isFavorite(manga.id.toString()) ? 'active' : ''}`}
                title={isFavorite(manga.id.toString()) ? "お気に入りから削除" : "お気に入りに追加"}
              >
                <Heart size={20} fill={isFavorite(manga.id.toString()) ? "var(--accent)" : "none"} />
              </button>
              <button onClick={handleShare} className="share-btn" title="シェアする">
                <Share2 size={20} />
              </button>
            </div>
          </div>
          <p className="detail-author">{manga.author}</p>

          <div className="detail-tags">
            {manga.tags?.map(tag => tag && (
              <Link key={tag} to={`/tag/${tag}`} className="tag-badge clickable">#{tag}</Link>
            ))}
          </div>

          <div className="detail-description">
            <h3>作品紹介</h3>
            <p>{manga.description}</p>
          </div>

          <div className="purchase-card">
            <div className="purchase-header">
              <ShoppingCart size={20} />
              <span>今すぐこの作品を読む</span>
            </div>

            <div className="purchase-grid">
              <div className="purchase-column">
                <div className="link-group-label"><Smartphone size={14} /> 電子書籍</div>
                <div className="affiliate-grid">
                  <a
                    href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(manga.title + " Kindle版")}&tag=${AMAZON_ASSOCIATE_ID}&rh=n%3A2250762051`}
                    target="_blank" rel="noopener noreferrer" className="purchase-btn btn-kindle"
                  >Kindle</a>
                  <a
                    href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(manga.title)}/101227/?affiliateId=${RAKUTEN_AFFILIATE_ID}`}
                    target="_blank" rel="noopener noreferrer" className="purchase-btn btn-kobo"
                  >Kobo</a>
                </div>
              </div>

              <div className="purchase-column">
                <div className="link-group-label"><Book size={14} /> 紙の本</div>
                <div className="affiliate-grid">
                  <a
                    href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(manga.title + " 漫画")}&tag=${AMAZON_ASSOCIATE_ID}&rh=n%3A466280`}
                    target="_blank" rel="noopener noreferrer" className="purchase-btn btn-amazon"
                  >Amazon</a>
                  <a
                    href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(manga.title)}/200162/?affiliateId=${RAKUTEN_AFFILIATE_ID}`}
                    target="_blank" rel="noopener noreferrer" className="purchase-btn btn-rakuten"
                  >楽天</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* レコメンドセクション */}
      <section className="related-section">
        <div className="related-header">
          <History size={24} className="related-icon" />
          <div className="related-text">
            <h2>あなたにおすすめの関連作品</h2>
            <p>この作品をチェックしたユーザーは、こちらもの作品も見ています</p>
          </div>
        </div>
        <div className="manga-grid">
          {relatedManga.map((m, idx) => (
            <MangaCard key={m.id} manga={m} index={idx} />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

// ホーム（一覧ページ）
const HomePage = ({ query, setQuery, results, loadMore, hasMore, favorites, history }) => {
  const observer = React.useRef();
  const lastElementRef = React.useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadMore, hasMore]);

  return (
    <div className="container">
      <header>
        <div className="logo-container">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1>Manga Reach</h1>
            <p className="subtitle">1万件の最高画質データから、あなたにぴったりの運命の一冊を瞬時に。</p>
          </motion.div>
        </div>

        <div className="search-wrapper">
          <Search className="search-icon" size={24} />
          <input
            type="text" className="search-bar"
            placeholder="作品名、著者名、キーワードで検索..."
            value={query} onChange={(e) => setQuery(e.target.value)}
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

        {/* 無限スクロールのトリガー要素 */}
        <div ref={lastElementRef} className="scroll-sentinel">
          {hasMore && (
            <div className="loading-spinner-container">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="loading-spinner"
              />
              <span>さらに作品を読み込み中...</span>
            </div>
          )}
        </div>

        {results.length === 0 && (
          <div className="no-results">
            <p>見つかりませんでした。別のキーワードをお試しください。</p>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered:', registration))
          .catch(error => console.log('SW registration failed:', error));
      });
    }
  }, []);

  const [displayCount, setDisplayCount] = useState(60);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('manga-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('manga-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('manga-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('manga-history', JSON.stringify(history));
  }, [history]);

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  }, []);

  const addToHistory = useCallback((id) => {
    setHistory(prev => {
      const filtered = prev.filter(hid => hid !== id);
      return [id, ...filtered].slice(0, 12); // 最大12件
    });
  }, []);

  const fuse = useMemo(() => new Fuse(mangaData, {
    keys: ['title', 'author', 'description', 'tags'],
    threshold: 0.35,
    distance: 100,
  }), []);

  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + 40);
  }, []);

  useEffect(() => {
    // 検索クエリが変わったら表示件数をリセット
    setDisplayCount(60);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setResults(mangaData.slice(0, displayCount));
      // ホームページに戻った時にタイトルをリセット
      document.title = "Manga Reach（マンガ・リーチ） - 日本最大級の1万件から見つかる究極の漫画検索ツール";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', "Manga Reach（マンガ・リーチ）は、1万件以上の実在する漫画データから、あなたにぴったりの一冊を瞬時に見つけることができる最強の検索ツールです。");
      }
      return;
    }
    const filtered = fuse.search(query).map(r => r.item);
    setResults(filtered.slice(0, displayCount));
  }, [query, fuse, displayCount]);

  const hasMore = useMemo(() => {
    if (!query) return displayCount < mangaData.length;
    const totalFiltered = fuse.search(query).length;
    return displayCount < totalFiltered;
  }, [query, fuse, displayCount]);

  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={
            <HomePage
              query={query}
              setQuery={setQuery}
              results={results}
              loadMore={loadMore}
              hasMore={hasMore}
              favorites={favorites}
              history={history}
            />
          } />
          <Route path="/manga/:id" element={
            <MangaDetail
              toggleFavorite={toggleFavorite}
              isFavorite={(id) => favorites.includes(id)}
              addToHistory={addToHistory}
            />
          } />
          <Route path="/tag/:tagName" element={<TagPage />} />
          <Route path="/about" element={<div className="container pt-layout"><button onClick={() => window.history.back()} className="back-btn"><ArrowLeft size={16} />戻る</button><About /></div>} />
          <Route path="/privacy" element={<div className="container pt-layout"><button onClick={() => window.history.back()} className="back-btn"><ArrowLeft size={16} />戻る</button><PrivacyPolicy /></div>} />
        </Routes>

        <footer>
          <nav className="footer-nav">
            <Link to="/" className="footer-link">HOME</Link>
            <Link to="/about" className="footer-link">ABOUT</Link>
            <Link to="/privacy" className="footer-link">PRIVACY</Link>
          </nav>
          <div className="trust-badge">
            <ShieldCheck size={16} />
            <span>当サイトは正規リンクのみを提供しています。</span>
          </div>
          <p className="copyright">© 2026 Manga Reach. All Rights Reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
