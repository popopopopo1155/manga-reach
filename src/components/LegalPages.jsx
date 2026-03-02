import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Info, ExternalLink } from 'lucide-react';

const LegalPage = ({ title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="legal-container glass"
        style={{ padding: '3rem', marginTop: '2rem', textAlign: 'left', lineHeight: '1.8', maxWidth: '900px', margin: '2rem auto' }}
    >
        <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #a5b4fc 0%, #f43f5e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
        }}>{title}</h1>
        <div className="legal-content" style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>
            {children}
        </div>
    </motion.div>
);

export const PrivacyPolicy = () => (
    <LegalPage title="プライバシーポリシー">
        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem', marginBottom: '1.5rem' }}>広告の配信について</h2>
            <p>当サイトでは、第三者配信の広告サービス「Google アドセンス」を利用しています。</p>
            <p>広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。これによってユーザーのブラウザを識別できるようになりますが、個人を特定するものではありません。</p>
            <p>Cookieを無効にする方法やGoogleアドセンスに関する詳細は「<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc' }}>広告 – ポリシーと規約 – Google</a>」をご確認ください。</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem', marginBottom: '1.5rem' }}>アクセス解析ツールについて</h2>
            <p>当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。</p>
            <p>このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem', marginBottom: '1.5rem' }}>免責事項</h2>
            <p>当サイトのコンテンツ・情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、情報の正確性や安全性を保証するものではありません。誤情報が入り込んだり、情報が古くなっていることもございます。</p>
            <p>当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。また、当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。</p>
        </section>

        <section>
            <h2 style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem', marginBottom: '1.5rem' }}>著作権・肖像権について</h2>
            <p>当サイトで掲載している画像の著作権・肖像権等は各権利所有者に帰属します。権利を侵害する目的ではありません。当サイトは楽天ブックスAPIおよびAmazonアソシエイト・プログラムの正当な利用規約に基づき書影を表示しています。</p>
            <p>記事の内容や掲載画像等に問題がございましたら、各権利所有者様本人が直接メールでご連絡下さい。確認後、対応させて頂きます。</p>
        </section>
    </LegalPage>
);

export const About = () => (
    <LegalPage title="当サイトについて（運営者情報）">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #f43f5e)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '2rem' }}>📚</div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>運営者：Manga Reach 編集部</h3>
                <p style={{ margin: '0.5rem 0 0', opacity: 0.8 }}>漫画ソムリエ / エンジニア</p>
            </div>
        </div>

        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderLeft: '4px solid #6366f1', paddingLeft: '1rem', marginBottom: '1.5rem' }}>サイト開設の思い</h2>
            <p>「読みたい漫画があるけれど、多すぎて選べない」「埋もれている名作をもっと知ってほしい」</p>
            <p>そんな思いから、Manga Reach（マンガ・リーチ）は誕生しました。単なるデータベースではなく、長年漫画を愛してきた運営者の視点と、最新のデータ解析を組み合わせて、あなたにとっての「運命の一冊」を届けることをミッションとしています。</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderLeft: '4px solid #6366f1', paddingLeft: '1rem', marginBottom: '1.5rem' }}>当サイトのこだわり</h2>
            <ul>
                <li><strong>厳選されたデータ</strong>: APIから取得した情報をそのまま流すのではなく、クオリティの高い作品を独自アルゴリズムで抽出。</li>
                <li><strong>伝説級のキュレーション</strong>: 10代のトレンドから50代以上の不朽の名作まで、世代を超えて愛される「伝説級」をカテゴリー化。</li>
                <li><strong>クリーンな環境</strong>: 違法アップロード等とは一切無縁の、公式配信・公式販売サイトへの正当なリンクのみを掲載しています。</li>
            </ul>
        </section>

        <section id="contact">
            <h2 style={{ borderLeft: '4px solid #6366f1', paddingLeft: '1rem', marginBottom: '1.5rem' }}>お問い合わせ</h2>
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p>掲載内容に関するお問い合わせ、削除依頼、広告掲載のご相談等は下記よりご連絡ください。</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#a5b4fc', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <Mail size={24} />
                    <span>support@manga-reach.com</span>
                </div>
                <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>※通常2〜3営業日以内にご返信いたします。</p>
                <a
                    href="https://github.com/popopopopo1155/manga-reach/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.9rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ExternalLink size={14} />
                    GitHub Issueでのご連絡はこちら
                </a>
            </div>
        </section>
    </LegalPage>
);
