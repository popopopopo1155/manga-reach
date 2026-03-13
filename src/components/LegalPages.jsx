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
            <h2 style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem', marginBottom: '1.5rem' }}>1. 広告の配信について</h2>
            <p>当サイトでは、第三者配信の広告サービス「Google アドセンス」を利用しています。</p>
            <p>広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。これによってユーザーのブラウザを識別できるようになりますが、個人を特定するものではありません。</p>
            <p>また、当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。</p>
            <p>Cookieを無効にする方法やGoogleアドセンスに関する詳細は「<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc' }}>広告 – ポリシーと規約 – Google</a>」をご確認ください。</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem', marginBottom: '1.5rem' }}>2. アクセス解析ツールについて</h2>
            <p>当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。</p>
            <p>この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。この規約に関しての詳細は<a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc' }}>Googleアナリティクスサービス利用規約</a>のページや<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc' }}>Googleポリシーと規約</a>ページをご覧ください。</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem', marginBottom: '1.5rem' }}>3. 免責事項</h2>
            <p>当サイトのコンテンツ・情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、情報の正確性や安全性を保証するものではありません。誤情報が入り込んだり、情報が古くなっていることもございます。</p>
            <p>当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。また、当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。本サービスが紹介する商品等の価格、詳細、販売状況等は、リンク先の各販売店（Amazon、楽天等）において改めてご確認ください。</p>
        </section>

        <section>
            <h2 style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem', marginBottom: '1.5rem' }}>4. 著作権・肖像権について</h2>
            <p>当サイトで掲載している画像の著作権・肖像権等は各権利所有者に帰属します。当サイトは、著作権の侵害を目的としたものではありません。書影素材は楽天ブックスAPIおよびAmazonアソシエイト・プログラムを通じて提供される公式な商品画像のみを使用しており、引用の範囲を超えたコンテンツの複製・頒布は一切行っておりません。</p>
            <p>記事の内容や掲載画像等に問題がございましたら、各権利所有者様本人が直接メールでご連絡下さい。本人確認（権利者であることの証明）ができ次第、迅速に削除等の対応をさせていただきます。</p>
        </section>
    </LegalPage>
);

export const About = () => (
    <LegalPage title="Manga Reach について">
        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>「マンガとの出会いを、もっとスマートに。」</h2>
            <p>Manga Reach（マンガ・リーチ）は、溢れかえるマンガ作品の中から、読者が「今、本当に読むべき一冊」へ最短距離で到達するためのガイドサイトを目指しています。</p>
        </div>

        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderLeft: '4px solid #6366f1', paddingLeft: '1rem', marginBottom: '1.5rem' }}>運営体制・編集方針</h2>
            <p>当サイトは、マンガをこよなく愛する個人編集部によって運営されています。私たちは、単なるデータベースの提供にとどまらず、以下の3つの編集方針を掲げています。</p>
            <ul style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                <li style={{ listStyle: 'none', background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '0.8rem' }}>
                    <strong>1. 公式・正規ルートへのこだわり</strong><br />
                    漫画文化の持続的な発展を願い、公式な販売サイト・配信サービスへのリンクのみを掲載。違法サイト排除とクリエイターへの還元を支持します。
                </li>
                <li style={{ listStyle: 'none', background: 'rgba(244,63,94,0.1)', padding: '1rem', borderRadius: '0.8rem' }}>
                    <strong>2. AI×人力による高度なレコメンド</strong><br />
                    1万件超の膨大なデータから、独自アルゴリズムを用いて評価の高い作品を抽出。さらに、編集部が1点ずつ作品性を確認し、おすすめポイントを付加しています。
                </li>
                <li style={{ listStyle: 'none', background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '0.8rem' }}>
                    <strong>3. 世代・属性を問わない開拓</strong><br />
                    少年・少女・青年・女性といった枠組みを超え、異世界から日常系、隠れた名作まで、あらゆるユーザーの好みに応える「全方位型」の開拓を目指します。
                </li>
            </ul>
        </section>

        <section id="contact">
            <h2 style={{ borderLeft: '4px solid #6366f1', paddingLeft: '1rem', marginBottom: '1.5rem' }}>運営者情報・お問い合わせ</h2>
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '1rem 0', fontWeight: 'bold', width: '30%' }}>サイト名称</td>
                            <td style={{ padding: '1rem 0' }}>Manga Reach（マンガ・リーチ）</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>運営主体</td>
                            <td style={{ padding: '1rem 0' }}>Manga Reach 編集部（代表：そむりえ）</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>主な事業内容</td>
                            <td style={{ padding: '1rem 0' }}>書籍・コミックの紹介、書評メディアの運営</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>所在地</td>
                            <td style={{ padding: '1rem 0' }}>東京都内（詳細は個別のお問い合わせにより開示）</td>
                        </tr>
                    </tbody>
                </table>
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p>作品の掲載依頼、広告のご相談、内容の誤りに関するご指摘等は以下までお寄せください。</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#a5b4fc', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <Mail size={24} />
                        <span>support@manga-reach.com</span>
                    </div>
                </div>
            </div>
        </section>
    </LegalPage>
);
