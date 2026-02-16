import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, ExternalLink, ShoppingCart, Star, Info, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mangaData from './data/mangaData.json';
import { PrivacyPolicy, About } from './components/LegalPages';

const RAKUTEN_AFFILIATE_ID = "5025407c.d8994699.5025407d.e9a413e7";
const AMAZON_ASSOCIATE_ID = "mangaanimeosu-22";

// 共通のカードコンポーネント
const MangaCard = ({ manga, index }) => (
  <motion.article
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3, delay: index ? (index % 10) * 0.05 : 0 }}
    className="manga-card glass"
  >
    <div className="cover-container">
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
      <div className="rating">
        <Star size={14} fill="#fbbf24" stroke="none" />
        <span>{manga.rating}</span>
      </div>
    </div>

    <div className="card-content">
      <h3 className="manga-title">{manga.title}</h3>
      <p className="manga-author">{manga.author}</p>
      <p className="manga-description">
        {manga.description.length > 80
          ? manga.description.substring(0, 80) + "..."
          : manga.description}
      </p>
      <div className="tags">
        {manga.tags.map(tag => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>

      {manga.isReal && (
        <div className="affiliate-links">
          <a
            href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(manga.title + " 漫画")}&tag=${AMAZON_ASSOCIATE_ID}&rh=n%3A466280`}
            target="_blank"
            rel="noopener noreferrer"
            className="button amazon-btn"
          >
            <ShoppingCart size={18} style={{ marginRight: '8px' }} />
            Amazonで探す
          </a>
          <a
            href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(manga.title)}/200162/?affiliateId=${RAKUTEN_AFFILIATE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="button rakuten-btn"
          >
            <ExternalLink size={18} style={{ marginRight: '8px' }} />
            楽天で探す
          </a>
        </div>
      )}
    </div>
  </motion.article>
);

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    if (page !== 'home') setQuery('');
  };

  // Fuse.js options
  const fuseOptions = {
    keys: ['title', 'tags', 'description'],
    threshold: 0.35,
    distance: 100,
    ignoreLocation: true,
  };

  const fuse = useMemo(() => new Fuse(mangaData, fuseOptions), []);

  // SEO/Curation logic: High-accuracy subsets
  const featured = useMemo(() => {
    // 殿堂入りの名作リスト（1万件のデータから確実に見つけるためのキーワード）
    const hofKeywords = ["ONE PIECE", "名探偵コナン", "SLAM DUNK", "ドラゴンボール", "NARUTO", "BLEACH", "進撃の巨人", "鋼の錬金術師", "HUNTER×HUNTER", "ジョジョ"];
    // トレンド作品リスト
    const trendKeywords = ["葬送のフリーレン", "呪術廻戦", "チェンソーマン", "ブルーロック", "僕のヒーローアカデミア", "怪獣8号", "ダンダダン", "SPY×FAMILY"];

    const findBestMatches = (keywords) => {
      const results = [];
      keywords.forEach(kw => {
        // 部分一致で検索し、最も評価が高い（または短いタイトル＝本編に近い）ものを選択
        const matches = mangaData.filter(m => m.title.toLowerCase().includes(kw.toLowerCase()));
        if (matches.length > 0) {
          const best = matches.sort((a, b) => a.title.length - b.title.length || b.rating - a.rating)[0];
          if (!results.some(r => r.id === best.id)) results.push(best);
        }
      });
      return results;
    };

    const trendingList = findBestMatches(trendKeywords);
    const hofList = findBestMatches(hofKeywords);
    const sortedByRating = [...mangaData].sort((a, b) => b.rating - a.rating);

    return {
      trending: trendingList.length >= 4 ? trendingList.slice(0, 8) : sortedByRating.slice(20, 28),
      hallOfFame: hofList.length >= 4 ? hofList.slice(0, 8) : sortedByRating.slice(0, 8),
      fantasy: mangaData.filter(m => m.tags.includes('ファンタジー') && m.rating >= 4.5).slice(0, 8)
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
        {currentPage !== 'home' && (
          <button onClick={() => setCurrentPage('home')} className="back-btn glass">
            <ArrowLeft size={18} /> 戻る
          </button>
        )}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => handlePageChange('home')}
          style={{ cursor: 'pointer' }}
        >
          Manga Reach（マンガ・リーチ）
        </motion.h1>
        {currentPage === 'home' && (
          <>
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
          </>
        )}
      </header>

      <main className="container">
        {currentPage === 'privacy' && <PrivacyPolicy />}
        {currentPage === 'about' && <About />}

        {currentPage === 'home' && (
          <>
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

                {/* 広告シミュレート枠（AdSense審査用） */}
                <div className="ad-placeholder-horizontal glass">
                  <p>Sponsored Content</p>
                  <span>ここに最適な広告が表示されます</span>
                </div>

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

                <section className="featured-group" style={{ marginTop: '5rem' }}>
                  <div className="section-header">
                    <h2>マガジン：Manga Reach編集部からのお知らせ</h2>
                    <p>話題の新作情報、おすすめの特集、運営からのお役立ち情報をお届けします</p>
                  </div>
                  <div className="news-list glass" style={{ padding: '2rem' }}>
                    <article className="news-item">
                      <span className="news-date">2026.02.16</span>
                      <h4 className="news-title">【特集】2026年春に見るべき「泣ける」漫画10選を公開しました</h4>
                    </article>
                    <article className="news-item">
                      <span className="news-date">2026.02.15</span>
                      <h4 className="news-title">データベース更新：新たに120作品の追加を行いました</h4>
                    </article>
                    <article className="news-item">
                      <span className="news-date">2026.02.14</span>
                      <h4 className="news-title">Manga Reachが正式オープン！1万件の検索機能が利用可能です</h4>
                    </article>
                  </div>
                </section>
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
          </>
        )}
      </main>

      <footer>
        <div className="footer-links">
          <button onClick={() => handlePageChange('home')}>トップ</button>
          <button onClick={() => handlePageChange('about')}>当サイトについて</button>
          <button onClick={() => handlePageChange('privacy')}>プライバシーポリシー</button>
        </div>
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
