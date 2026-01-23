import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Modal from '../components/Modal';

const Dashboard = () => {
    const [notes, setNotes] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [viewMode, setViewMode] = useState('notes'); // 'notes' or 'quizzes'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [notesRes, quizzesRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/notes', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:3000/api/quizzes', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setNotes(notesRes.data);
                setQuizzes(quizzesRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [location]); // Re-fetch when location changes (navigating back to dashboard)

    const openQuizModal = (noteId) => {
        setSelectedNoteId(noteId);
        setModalOpen(true);
    };

    const handleGenerateQuiz = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:3000/api/quizzes/generate',
                { noteId: selectedNoteId, numQuestions: parseInt(numQuestions) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setModalOpen(false);
            navigate(`/quiz/${res.data.id}`);
        } catch (err) {
            alert('Error generating quiz');
        }
    };

    const deleteNote = async (id) => {
        if (!confirm('Are you sure?')) return; // Could replace this with modal too, but leaving for speed
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/notes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(notes.filter(n => n.id !== id));
        } catch (err) {
            alert('Error deleting note');
        }
    };

    return (
        <div>
            <h1 style={{ color: 'var(--text-color)', marginBottom: '2rem' }}>My Study Dashboard</h1>

            {/* Analytics Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div
                    className="glass-panel"
                    style={{ textAlign: 'center', background: 'rgba(108, 92, 231, 0.2)', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => {
                        setViewMode('notes');
                        setTimeout(() => document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <h3 style={{ margin: 0, fontSize: '2.5rem' }}>{notes.length}</h3>
                    <p style={{ opacity: 0.8 }}>Notes Created</p>
                </div>
                <div
                    className="glass-panel"
                    style={{ textAlign: 'center', background: 'rgba(0, 184, 148, 0.2)', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => {
                        setViewMode('quizzes');
                        setTimeout(() => document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <h3 style={{ margin: 0, fontSize: '2.5rem' }}>{quizzes.length}</h3>
                    <p style={{ opacity: 0.8 }}>Quizzes Saved</p>
                </div>
            </div>

            <h2 id="content-section" style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>{viewMode === 'notes' ? 'My Notes' : 'My Quiz Library'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {viewMode === 'notes' ? (
                    <>
                        {/* Create New Note Card */}
                        <Link to="/editor" className="glass-panel" style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', border: '2px dashed var(--glass-border)', background: 'transparent',
                            textDecoration: 'none', color: 'var(--text-color)', transition: 'all 0.3s'
                        }}>
                            <span style={{ fontSize: '3rem', opacity: 0.7 }}>+</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Create New Note</span>
                        </Link>

                        {/* Note Cards */}
                        {notes.map(note => (
                            <div key={note.id} className="glass-panel"
                                onClick={() => navigate(`/editor/${note.id}`)}
                                style={{
                                    padding: '1.5rem', display: 'flex', flexDirection: 'column',
                                    cursor: 'pointer', transition: 'transform 0.2s', position: 'relative'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <h3>{note.title}</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {note.summary ? note.summary.replace(/[#*`_]/g, '').substring(0, 100) + '...' : 'Processing summary...'}
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => openQuizModal(note.id)} style={{
                                        flex: 1, padding: '0.5rem', background: '#00b894', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold'
                                    }}>Quiz Me</button>
                                    <button onClick={() => deleteNote(note.id)} style={{
                                        padding: '0.5rem 1rem', background: '#ff7675', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold'
                                    }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {/* Quiz Cards */}
                        {quizzes.length === 0 ? (
                            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                                <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>No quizzes generated yet. Open a note to start!</p>
                            </div>
                        ) : (
                            quizzes.map(quiz => (
                                <div key={quiz.id} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{quiz.title}</h4>
                                        <span style={{
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            color: quiz.score !== null ? (quiz.score >= (quiz.questions?.length || 5) * 0.7 ? '#00b894' : '#ff7675') : 'var(--glass-border)'
                                        }}>
                                            {quiz.score !== null ? `${quiz.score}/${quiz.questions?.length || '?'}` : 'N/A'}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
                                        Source: {quiz.note?.title || 'Unknown Note'}
                                    </p>
                                    <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.85rem', opacity: 0.6 }}>
                                        Created: {new Date(quiz.createdAt).toLocaleDateString()}
                                    </p>

                                    <button
                                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                                        style={{
                                            width: '100%', padding: '0.7rem', background: 'rgba(108, 92, 231, 0.6)',
                                            color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', marginTop: 'auto'
                                        }}
                                    >
                                        {quiz.score !== null ? 'Retake Quiz' : 'Take Quiz'}
                                    </button>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>

            <Modal
                isOpen={modalOpen}
                title="Start Quiz"
                onClose={() => setModalOpen(false)}
                actions={
                    <>
                        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--text-color)', color: 'var(--text-color)' }} onClick={() => setModalOpen(false)}>Cancel</button>
                        <button className="btn-primary" onClick={handleGenerateQuiz}>Generate Quiz</button>
                    </>
                }
            >
                <p style={{ marginBottom: '1rem' }}>How many questions would you like?</p>
                <input
                    type="number"
                    className="input-field"
                    min="1" max="20"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default Dashboard;
