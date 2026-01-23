import { useEffect, useState, useRef } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Modal from '../components/Modal';

const NoteEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false); // Valid loading state for upload
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (id) {
            const fetchNote = async () => {
                try {
                    const res = await api.get(`/notes/${id}`);
                    setTitle(res.data.title);
                    setContent(res.data.content);
                    setSummary(res.data.summary);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchNote();
        } else {
            // Reset fields for new note
            setTitle('');
            setContent('');
            setSummary('');
        }
    }, [id]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (id) {
                await api.put(`/notes/${id}`, { title, content });
                setModalMessage('Note updated successfully!');
                const res = await api.get(`/notes/${id}`);
                setSummary(res.data.summary);
                setModalOpen(true);
            } else {
                await api.post('/notes', { title, content });
                navigate('/dashboard');
            }
        } catch (err) {
            setModalMessage('Error saving note');
            setModalOpen(true);
        }
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        setUploading(true); // Start loading UI

        try {
            const res = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setContent(res.data.text);
            setSummary(res.data.summary); // Set the auto-generated summary
            if (!title) setTitle(file.name);
            setModalMessage("Document processed and summarized successfully!");
            setModalOpen(true);
        } catch (error) {
            setModalMessage("Upload Failed: " + (error.response?.data?.message || error.message));
            setModalOpen(true);
        }
        setUploading(false); // Stop loading UI
        e.target.value = null; // Reset input to allow re-uploading same file if needed
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', height: '80vh' }}>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Note Title"
                        className="input-field"
                        style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 0, width: '60%' }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".txt,.pdf,.docx"
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                            style={{
                                background: uploading ? '#b2bec3' : 'rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                cursor: uploading ? 'wait' : 'pointer'
                            }}
                        >
                            {uploading ? '⏳ Uploading...' : '📂 Upload Doc'}
                        </button>
                    </div>
                </div>

                <textarea
                    placeholder="Paste your study notes here or upload a document..."
                    style={{
                        flex: 1,
                        width: '100%',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        resize: 'none',
                        fontSize: '1rem'
                    }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>

                <button
                    className="btn-primary"
                    style={{ marginTop: '1rem' }}
                    onClick={handleSave}
                    disabled={loading || uploading}
                >
                    {loading ? 'Analyzing...' : (id ? 'Update Note' : 'Save & Analyze')}
                </button>

                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        background: 'transparent',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-color)',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Back to Dashboard
                </button>

            </div>

            <div className="glass-panel">
                <h3>AI Analysis</h3>
                {uploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.8 }}>
                        <p>Reading document and generating summary...</p>
                    </div>
                ) : summary ? (
                    <div style={{ marginTop: '1rem', height: '90%', overflowY: 'auto' }} className="markdown-content">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
                        <p>{loading ? "Processing..." : "AI Summary will appear here after saving (or uploading)..."}</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={modalOpen}
                title="Notice"
                onClose={() => setModalOpen(false)}
            >
                <p>{modalMessage}</p>
            </Modal>
        </div>
    );
};

export default NoteEditor;
