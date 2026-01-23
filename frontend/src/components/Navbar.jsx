import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    const hideDashboardLink = ['/', '/login', '/register'].includes(location.pathname);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <nav style={{
            padding: '1rem 2rem',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(5px)',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--text-color)',
            transition: 'all 0.3s'
        }}>
            <Link to={token ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
                <img src="/logo.png" alt="My Study Logo" style={{ height: '40px', width: 'auto' }} />
                <h2 style={{ fontWeight: '700', fontSize: '1.5rem', margin: 0 }}>My Study</h2>
            </Link>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={toggleTheme} style={{
                    background: 'transparent',
                    color: 'var(--text-color)',
                    fontSize: '1.2rem',
                    padding: '0.4rem',
                    borderRadius: '50%',
                    border: '1px solid var(--glass-border)'
                }}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                {token ? (
                    <>
                        <button onClick={handleLogout} style={{
                            background: 'transparent',
                            color: theme === 'light' ? '#000000' : '#ff7675',
                            fontWeight: '700',
                            border: `2px solid ${theme === 'light' ? '#000000' : '#ff7675'}`,
                            padding: '0.4rem 1rem',
                            borderRadius: '6px'
                        }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'var(--text-color)', fontWeight: '600' }}>Login</Link>
                        <Link to="/register" style={{ color: 'var(--text-color)', fontWeight: '600' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
