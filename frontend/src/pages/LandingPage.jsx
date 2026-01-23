import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div style={{ paddingBottom: '6rem' }}>
            {/* Professional Hero Section */}
            <section style={{
                padding: '8rem 2rem',
                textAlign: 'center',
                background: 'var(--gradient)',
                borderBottom: '1px solid var(--glass-border)',
                marginBottom: '4rem'
            }}>
                <div className="container" style={{ maxWidth: '1000px' }}>
                    <h1 style={{
                        fontSize: '4.5rem',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        fontWeight: 900,
                        color: 'var(--text-color)',
                        letterSpacing: '-2px'
                    }}>
                        Your Entire Study Workflow,<br />Accelerated by AI.
                    </h1>
                    <p style={{
                        fontSize: '1.5rem',
                        opacity: 0.9,
                        maxWidth: '750px',
                        margin: '0 auto 3rem',
                        lineHeight: 1.5,
                        color: 'var(--text-color)'
                    }}>
                        Organize your knowledge, generate high-impact quizzes, and master complex subjects faster than ever before.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/register" className="btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem', borderRadius: '12px' }}>
                            Start Learning for Free
                        </Link>
                        <Link to="/login" className="btn-primary" style={{
                            padding: '1.2rem 2.5rem',
                            fontSize: '1.2rem',
                            background: 'transparent',
                            border: '2px solid var(--text-color)',
                            color: 'var(--text-color)',
                            borderRadius: '12px'
                        }}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Core Value Pillars */}
            <section className="container" style={{ maxWidth: '1100px', marginBottom: '6rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', fontWeight: 800 }}>The Intelligent Way to Study</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ fontSize: '2.5rem' }}>📑</div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Structured Insight</h3>
                        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>Our distraction-free editor helps you capture ideas fluently, while AI automatically structures your notes for maximum retention.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ fontSize: '2.5rem' }}>⚡</div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Pulse Quizzes</h3>
                        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>Convert any source material into interactive assessments in seconds. Active recall is the most scientifically proven method to learn.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ fontSize: '2.5rem' }}>🎨</div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Adaptive Interface</h3>
                        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>Whether you prefer a sleek dark mode or a high-contrast negative light mode, My Study adapts to your environment and focus needs.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="container" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(108, 92, 231, 0.1)', borderRadius: '24px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Ready to upgrade your mind?</h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>Join thousands of students and professionals using My Study today.</p>
                <Link to="/register" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '12px' }}>
                    Get Started Now
                </Link>
            </section>
        </div>
    );
};

export default LandingPage;
