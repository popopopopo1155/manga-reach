import React from 'react';
import { motion } from 'framer-motion';

const LegalPage = ({ title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="legal-container glass"
        style={{ padding: '3rem', marginTop: '2rem', textAlign: 'left', lineHeight: '1.8' }}
    >
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #a5b4fc 0%, #f43f5e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{title}</h1>
        <div className="legal-content" style={{ color: 'var(--text-main)' }}>
            {children}
        </div>
    </motion.div>
);

export const PrivacyPolicy = () => (
    <LegalPage title="プライバシーポリシー">
        <section>
            <h2>広告の配信について</h2>
            <p>当サイトでは、第三者配信の広告サービス「Google アドセンス」を利用しています。このような広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、当サイトや他サイトへのアクセスに関する情報 「Cookie」(氏名、住所、メール アドレス、電話番号は含まれません) を使用することがあります。</p>
        </section>
        <section>
            <h2>アクセス解析ツールについて</h2>
            <p>当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。</p>
        </section>
        <section>
            <h2>免責事項</h2>
            <p>当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。当サイトのコンテンツ・情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、誤情報が入り込んだり、情報が古くなっていることもございます。当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。</p>
        </section>
    </LegalPage>
);

export const About = () => (
    <LegalPage title="当サイトについて">
        <p>Manga Reach（マンガ・リーチ）は、10,000件を超える膨大な漫画データベースから、あなたにぴったりの一冊を見つけるための検索・おすすめツールです。</p>
        <p>「読みたい漫画が多すぎて選べない」「新しいジャンルを開拓したい」というユーザーの声に応えるため、最新のトレンドから不朽の名作まで、網羅的なデータに基づいた提案を行います。</p>
        <h2>お問い合わせ</h2>
        <p>当サイトに関するお問い合わせ、および掲載内容に関する削除依頼等は、GitHubのリポジトリ、または運営者までご連絡ください。</p>
    </LegalPage>
);
