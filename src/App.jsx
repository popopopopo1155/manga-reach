import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Search, Star, ExternalLink, ShoppingCart, Info, ShieldCheck, Mail, ArrowLeft, Smartphone, Book, Share2, Heart, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrivacyPolicy, About } from './components/LegalPages';

// Dynamic data loading to handle large JSON size
let mangaDataCache = [];
async function loadMangaData() {
  if (mangaDataCache.length > 0) return mangaDataCache;
  const data = await import('./data/mangaData.json');
  mangaDataCache = data.default;
  return mangaDataCache;
}

const RAKUTEN_AFFILIATE_ID = "5025407c.d8994699.5025407d.e9a413e7";
const AMAZON_ASSOCIATE_ID = "mangaanimeosu-22";
const SITE_URL = "https://manga-reach.com";

// GA4 Tracking Utility
const trackGAEvent = (action, category, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      'event_category': category,
      'event_label': label,
      'value': value
    });
  }
};
// Analytics & Utility Component
const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
  return null;
};

// AdSense A/B Test Wrapper
const AdUnit = ({ slot, format = 'auto', className = '', adGroup }) => {
  // グループによって表示を切り替えたい場合はここでロジックを書く
  const isVisible = adGroup === 'B' || slot === 'footer'; // グループBは積極的、Aはフッターのみ

  if (!isVisible) return null;

  return (
    <div className={`ad-container ${className}`}>
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1271577830109733"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"></ins>
      <div className="ad-label">ADVERTISEMENT</div>
    </div>
  );
};

// Breadcrumbs UI component
const Breadcrumbs = ({ paths }) => (
  <nav className="breadcrumbs" aria-label="Breadcrumb">
    <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
      <li><Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>ホーム</Link></li>
      {paths.map((p, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <span className="separator" style={{ margin: '0 0.5rem', opacity: 0.5 }}>/</span>
          {p.link ?
            <Link to={p.link} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{p.name}</Link> :
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</span>
          }
        </li>
      ))}
    </ol>
  </nav>
);

// 404 Page
const NotFound = () => (
  <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
      <p style={{ marginBottom: '2rem' }}>お探しのページは見つかりませんでした。</p>
      <Link to="/" className="mini-btn btn-primary">ホームに戻る</Link>
    </motion.div>
  </div>
);

// 共通のカードコンポーネント (シリーズ単位)
const SeriesCard = ({ series, index }) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.5, delay: index ? (index % 12) * 0.04 : 0 }}
    className="manga-card series-card"
  >
    <Link to={`/series/${series.seriesId}`} className="card-link-wrapper">
      <div className="cover-container">
        {series.cover ? (
          <img
            src={series.cover}
            alt={`${series.seriesTitle} - ${series.author}作品`}
            className="manga-cover"
            loading="lazy"
          />
        ) : (
          <div className="manga-cover-placeholder">
            <span>画像検索中...</span>
          </div>
        )}
        <div className="volume-count-badge">
          全{series.volumes.length}巻
        </div>
        <div className="rating-overlay">
          <Star size={12} fill="#fbbf24" stroke="none" />
          {series.rating}
        </div>
      </div>

      <div className="card-content">
        <h3 className="manga-title" title={series.seriesTitle}>{series.seriesTitle}</h3>
        <p className="manga-author">{series.author}</p>
        <div className="card-footer-info">
          <span className="info-badge">
            <Book size={14} /> 全巻を見る
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
);

// 個別巻用カードコンポーネント (検索結果や関連作品用)
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
            alt={`${manga.title} - ${manga.author}作品`}
            className="manga-cover"
            loading="lazy"
          />
        ) : (
          <div className="manga-cover-placeholder">
            <span>画像検索中...</span>
          </div>
        )}
        <div className="rating-overlay">
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

// 個別巻カードコンポーネント (シリーズ詳細用)
const VolumeCard = ({ manga, index }) => (
  <motion.article
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: (index % 12) * 0.03 }}
    className="volume-card"
  >
    <Link to={`/manga/${manga.id}`} className="volume-link">
      <div className="volume-cover-wrapper">
        <img src={manga.cover} alt={manga.title} loading="lazy" />
        <div className="volume-number-overlay">
          第{manga.volumeNumber}巻
        </div>
      </div>
      <div className="volume-info">
        <h4 className="volume-title">第{manga.volumeNumber}巻</h4>
      </div>
    </Link>
  </motion.article>
);

// シリーズ詳細ページ (Plan A)
const SeriesDetail = ({ dataLoaded }) => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  const series = useMemo(() => {
    if (!dataLoaded) return null;
    const volumes = mangaDataCache.filter(m => m.seriesId === seriesId);
    if (volumes.length === 0) return null;

    // ソート
    volumes.sort((a, b) => {
      const aNum = parseInt(a.volumeNumber) || 0;
      const bNum = parseInt(b.volumeNumber) || 0;
      return aNum - bNum;
    });

    return {
      seriesId,
      seriesTitle: volumes[0].seriesTitle,
      author: volumes[0].author,
      cover: volumes[0].cover,
      description: volumes[0].description, // 1巻の説明をシリーズ説明として借用
      volumes
    };
  }, [seriesId, dataLoaded]);

  useEffect(() => {
    if (series) {
      document.title = `${series.seriesTitle} シリーズ一覧 - Manga Reach`;
      window.scrollTo(0, 0);
    }
  }, [series]);

  if (!dataLoaded) return <div className="loader-container"><div className="loader"></div></div>;
  if (!series) return <NotFound />;

  return (
    <div className="container pt-layout">
      <Breadcrumbs paths={[{ name: series.seriesTitle }]} />

      <div className="series-header-hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${series.cover})` }}></div>
        <div className="hero-content">
          <div className="hero-poster">
            <img src={series.cover} alt={series.seriesTitle} />
          </div>
          <div className="hero-text">
            <h1 className="series-main-title">{series.seriesTitle}</h1>
            <p className="series-author-name">{series.author}</p>
            <p className="series-meta">全{series.volumes.length}巻</p>
            <div className="series-desc-box">
              <p>{series.description}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="volume-grid-section">
        <h2 className="section-title">巻数一覧</h2>
        <div className="volume-grid">
          {series.volumes.map((vol, idx) => (
            <VolumeCard key={vol.id} manga={vol} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
};

// 作品詳細ページコンポーネント (タグをクリック可能に修正)
const MangaDetail = ({ dataLoaded, toggleFavorite, isFavorite, addToHistory, adGroup }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const manga = useMemo(() => mangaDataCache.find(m => m.id.toString() === id), [id, dataLoaded]);

  useEffect(() => {
    if (id) addToHistory(id);
  }, [id, addToHistory]);

  const relatedManga = useMemo(() => {
    if (!manga) return [];
    return mangaDataCache
      .filter(m => m.id !== manga.id)
      .map(m => {
        let score = 0;
        // 著者が同じなら大幅加点
        if (m.author === manga.author) score += 10;
        // 共通タグ1つにつき加点
        const commonTags = m.tags?.filter(t => manga.tags?.includes(t)) || [];
        score += commonTags.length * 3;
        // レーティングも加味 (人気順)
        score += (m.rating || 0) * 0.5;
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

      // Canonical
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${SITE_URL}/manga/${id}`);

      // Book/Product Schema for Rich Snippets
      const bookSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": manga.title,
        "image": manga.cover,
        "description": manga.description,
        "brand": { "@type": "Brand", "name": manga.author },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": manga.rating,
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "120" // ダミー数だが検索結果を華やかにするために有用
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "JPY",
          "price": "500", // 平均価格のプレースホルダ
          "availability": "https://schema.org/InStock"
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'product-schema';
      script.text = JSON.stringify(bookSchema);
      const oldScript = document.getElementById('product-schema');
      if (oldScript) oldScript.remove();
      document.head.appendChild(script);
    }
    window.scrollTo(0, 0);

    return () => {
      const ps = document.getElementById('product-schema');
      if (ps) ps.remove();
    };
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

  if (!dataLoaded) return (
    <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
      <div className="loader"></div>
      <p style={{ marginTop: '1rem' }}>作品情報を読み込み中...</p>
    </div>
  );

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
      <Breadcrumbs paths={[{ name: manga.title }]} />

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
            <h3>あらすじ</h3>
            <p>{manga.description}</p>
          </div>

          {manga.commentary && (
            <div className="editorial-commentary glass">
              <div className="commentary-header">
                <Info size={18} className="commentary-icon" />
                <span>編集部のおすすめポイント</span>
              </div>
              <p>{manga.commentary}</p>
            </div>
          )}

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
                    onClick={() => trackGAEvent('affiliate_click', 'Electronic', manga.title, 1)}
                  >Kindle</a>
                  <a
                    href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(manga.title)}/101227/?affiliateId=${RAKUTEN_AFFILIATE_ID}`}
                    target="_blank" rel="noopener noreferrer" className="purchase-btn btn-kobo"
                    onClick={() => trackGAEvent('affiliate_click', 'Electronic', manga.title, 1)}
                  >Kobo</a>
                </div>
              </div>

              <div className="purchase-column">
                <div className="link-group-label"><Book size={14} /> 紙の本</div>
                <div className="affiliate-grid">
                  <a
                    href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(manga.title + " 漫画")}&tag=${AMAZON_ASSOCIATE_ID}&rh=n%3A466280`}
                    target="_blank" rel="noopener noreferrer" className="purchase-btn btn-amazon"
                    onClick={() => trackGAEvent('affiliate_click', 'Paper', manga.title, 1)}
                  >Amazon</a>
                  <a
                    href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(manga.title)}/200162/?affiliateId=${RAKUTEN_AFFILIATE_ID}`}
                    target="_blank" rel="noopener noreferrer" className="purchase-btn btn-rakuten"
                    onClick={() => trackGAEvent('affiliate_click', 'Paper', manga.title, 1)}
                  >楽天</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* レコメンドセクション */}
      <AdUnit slot="detail-top" adGroup={adGroup} className="detail-top-ad" />

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
const HomePage = ({ query, setQuery, results, loadMore, hasMore, favorites, history, adGroup, selectedGenre, setSelectedGenre }) => {
  const observer = useRef();
  const lastElementRef = useCallback(node => {
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
        <AdUnit slot="search-top" adGroup={adGroup} className="hero-bottom-ad" />
      </header>

      <main>
        {!query && (
          <>
            {favorites?.length > 0 && (
              <section className="user-section">
                <div className="section-header">
                  <Heart size={20} className="section-icon color-heart" />
                  <h2>お気に入り</h2>
                </div>
                <div className="manga-grid mini">
                  {favorites.map(fid => {
                    const m = mangaDataCache.find(md => md.id.toString() === fid);
                    return m ? <MangaCard key={m.id} manga={m} /> : null;
                  })}
                </div>
              </section>
            )}

            {history?.length > 0 && (
              <section className="user-section">
                <div className="section-header">
                  <History size={20} className="section-icon color-history" />
                  <h2>最近チェックした作品</h2>
                </div>
                <div className="manga-grid mini">
                  {history.map(hid => {
                    const m = mangaDataCache.find(md => md.id.toString() === hid);
                    return m ? <MangaCard key={m.id} manga={m} /> : null;
                  })}
                </div>
              </section>
            )}

            <div className="section-header main-header">
              <Star size={20} className="section-icon color-star" />
              <h2>おすすめの作品</h2>
            </div>

            <div className="genre-tabs">
              {[
                { id: 'all', name: 'すべて' },
                { id: 'shonen', name: '少年漫画', tag: '少年漫画' },
                { id: 'shojo', name: '少女漫画', tag: '少女漫画' },
                { id: 'seinen', name: '青年漫画', tag: '青年漫画' },
                { id: 'ladies', name: '女性漫画', tag: 'レディース' },
                { id: 'isekai', name: '異世界', tag: '異世界' },
                { id: 'love', name: 'ラブコメ', tag: 'ラブコメ' }
              ].map(g => (
                <button
                  key={g.id}
                  className={`genre-tab ${selectedGenre === g.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedGenre(g.id);
                    setQuery(''); // ジャンル選択時は検索をリセット
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    trackGAEvent('genre_tab_click', 'Engagement', g.id, 1);
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>

            <div className="trend-keywords">
              {[
                "バトル", "ファンタジー", "スポーツ", "サスペンス", "ホラー",
                "異世界転生", "最強", "悪役令嬢", "溺愛", "ラブコメ", "学園", "日常"
              ].map(kw => (
                <button
                  key={kw}
                  className="trend-tag"
                  onClick={() => {
                    setQuery(kw);
                    setSelectedGenre('all'); // キーワード検索時はジャンルをリセット
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    trackGAEvent('trend_keyword_click', 'Engagement', kw, 1);
                  }}
                >
                  #{kw}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="manga-grid">
          <AnimatePresence mode="popLayout">
            {results.map((item, idx) => {
              // シリーズカードか個別巻カードかを判別
              if (item.volumes) {
                return <SeriesCard key={item.seriesId} series={item} index={idx} />;
              } else {
                // 特定巻の検索結果（"キングダム 5" など）
                return <MangaCard key={item.id} manga={item} index={idx} />;
              }
            })}
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadMangaData().then(() => setDataLoaded(true));
  }, []);

  // データをシリーズ単位で集計
  const seriesData = useMemo(() => {
    if (!dataLoaded) return [];
    const groups = {};
    mangaDataCache.forEach(m => {
      if (!groups[m.seriesId]) {
        groups[m.seriesId] = {
          seriesId: m.seriesId,
          seriesTitle: m.seriesTitle,
          author: m.author,
          cover: m.cover,
          rating: m.rating,
          description: m.description,
          volumes: []
        };
      }
      groups[m.seriesId].volumes.push(m);
    });
    return Object.values(groups).sort((a, b) => b.rating - a.rating);
  }, [dataLoaded]);

  const fuse = useMemo(() => {
    if (!dataLoaded) return null;
    // 検索対象にシリーズと個別巻の両方を含める
    const searchItems = [
      ...seriesData,
      ...mangaDataCache.filter(m => m.isLegendary) // 伝説級は巻数直接検索にも対応
    ];
    return new Fuse(searchItems, {
      keys: ['seriesTitle', 'title', 'author', 'description', 'tags'],
      threshold: 0.35,
      distance: 100,
    });
  }, [dataLoaded, seriesData]);

  // 無限スクロールとユーザーデータのステート
  const [displayCount, setDisplayCount] = useState(24);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('manga_favs') || '[]'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('manga_history') || '[]'));
  const [adGroup] = useState(() => Math.random() > 0.5 ? 'A' : 'B');

  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + 24);
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [id, ...prev];
      localStorage.setItem('manga_favs', JSON.stringify(next));
      return next;
    });
  };

  const addToHistory = (id) => {
    setHistory(prev => {
      const next = [id, ...prev.filter(i => i !== id)].slice(0, 20);
      localStorage.setItem('manga_history', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (!dataLoaded) return;
    let filtered = seriesData; // デフォルトはシリーズ表示

    // 1. ジャンル・カテゴリーフィルタ
    if (selectedGenre !== 'all') {
      const genreIdMap = {
        shonen: '001001001',
        shojo: '001001002',
        seinen: '001001003',
        ladies: '001001004'
      };

      const targetGid = genreIdMap[selectedGenre];
      if (targetGid) {
        filtered = filtered.filter(s => s.volumes.some(v => v.genreId?.startsWith(targetGid)));
      } else {
        const categoryTags = {
          isekai: ['異世界', '転生', 'ファンタジー'],
          love: ['ラブコメ', 'キュンキュン', 'ラブストーリー', '恋愛']
        };
        const targets = categoryTags[selectedGenre];
        if (targets) {
          filtered = filtered.filter(s => s.volumes.some(v => v.tags?.some(tag => targets.some(target => tag.includes(target)))));
        }
      }
    }

    // 2. 検索クエリ（Fuse.js）
    if (query) {
      filtered = fuse.search(query).map(r => r.item);
    }

    // 3. 表示順
    const sorted = [...filtered].sort((a, b) => {
      const aLegend = a.volumes ? a.volumes.some(v => v.isLegendary) : a.isLegendary;
      const bLegend = b.volumes ? b.volumes.some(v => v.isLegendary) : b.isLegendary;
      if (aLegend && !bLegend) return -1;
      if (!aLegend && bLegend) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    setResults(sorted.slice(0, displayCount));
  }, [query, selectedGenre, fuse, displayCount, seriesData, dataLoaded]);

  const hasMore = useMemo(() => {
    if (!dataLoaded) return false;
    if (!query) return displayCount < seriesData.length;
    const totalFiltered = fuse?.search(query).length || 0;
    return displayCount < totalFiltered;
  }, [query, fuse, displayCount, dataLoaded, seriesData]);

  return (
    <Router>
      <AnalyticsTracker />
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
              adGroup={adGroup}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
            />
          } />
          <Route path="/series/:seriesId" element={<SeriesDetail dataLoaded={dataLoaded} />} />
          <Route path="/manga/:id" element={
            <MangaDetail
              dataLoaded={dataLoaded}
              toggleFavorite={toggleFavorite}
              isFavorite={(id) => favorites.includes(id)}
              addToHistory={addToHistory}
              adGroup={adGroup}
            />
          } />
          <Route path="/tag/:tagName" element={<TagPage dataLoaded={dataLoaded} />} />
          <Route path="/about" element={<div className="container pt-layout"><button onClick={() => window.history.back()} className="back-btn"><ArrowLeft size={16} />戻る</button><About /></div>} />
          <Route path="/privacy" element={<div className="container pt-layout"><button onClick={() => window.history.back()} className="back-btn"><ArrowLeft size={16} />戻る</button><PrivacyPolicy /></div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="site-footer">
          <nav className="footer-nav">
            <Link to="/" className="footer-link">ホーム</Link>
            <Link to="/about" className="footer-link">当サイトについて</Link>
            <Link to="/privacy" className="footer-link">プライバシーポリシー</Link>
            <a href="/about#contact" className="footer-link">お問い合わせ</a>
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
