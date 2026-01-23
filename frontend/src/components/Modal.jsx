import React from 'react';

const Modal = ({ isOpen, title, children, onClose, actions }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{ background: 'var(--modal-bg)', minWidth: '400px', maxWidth: '90%', color: 'var(--text-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    <h3>{title}</h3>
                    <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-color)', fontSize: '1.2rem' }}>&times;</button>
                </div>
                <div style={{ padding: '1rem 0' }}>
                    {children}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                    {actions ? actions : (
                        <button className="btn-primary" onClick={onClose}>Close</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;


// Backend: cd backend && npm install && npx prisma generate && npm run dev
// ML Service: cd ml_service && source venv/bin/activate && python main.py
// Frontend: cd frontend && npm install && npm run dev