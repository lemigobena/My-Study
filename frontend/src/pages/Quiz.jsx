import { useEffect, useState } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';

const Quiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/quizzes/${id}`);
                setQuiz(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        const submitScore = async () => {
            if (showScore && quiz) {
                try {
                    await api.put(`/quizzes/${id}/submit`, { score });
                } catch (err) {
                    console.error('Error submitting score:', err);
                }
            }
        };
        submitScore();
    }, [showScore, quiz, id, score]);

    const handleOptionClick = (option) => {
        if (selectedOption) return; // Prevent changing answer
        setSelectedOption(option);

        const correct = option === quiz.questions[currentQuestion].correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            setScore(score + 1);
        }

        // Auto move to next question after 2 seconds
        setTimeout(() => {
            const nextQuestion = currentQuestion + 1;
            if (nextQuestion < quiz.questions.length) {
                setCurrentQuestion(nextQuestion);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                setShowScore(true);
            }
        }, 2000);
    };

    if (!quiz) return <div style={{ color: 'white', textAlign: 'center', marginTop: '3rem' }}>Loading Quiz...</div>;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ width: '600px', maxWidth: '100%' }}>
                {showScore ? (
                    <div style={{ textAlign: 'center' }}>
                        <h2>Quiz Results</h2>
                        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>You scored {score} out of {quiz.questions.length}</p>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className="btn-primary"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)' }}
                                onClick={() => {
                                    setCurrentQuestion(0);
                                    setScore(0);
                                    setShowScore(false);
                                    setSelectedOption(null);
                                    setIsCorrect(null);
                                }}
                            >
                                Try Again
                            </button>
                            <button
                                className="btn-primary"
                                onClick={async () => {
                                    // Ensure score is submitted before navigating
                                    try {
                                        await api.put(`/quizzes/${id}/submit`, { score });
                                        console.log('Score submitted successfully');
                                    } catch (err) {
                                        console.error('Error submitting score:', err);
                                    }
                                    navigate('/dashboard');
                                }}
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>{quiz.title}</h2>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', opacity: 0.8 }}>
                            <span>Question {currentQuestion + 1}/{quiz.questions.length}</span>
                            <span>Current Score: {score}</span>
                        </div>

                        <h3 style={{ marginBottom: '2rem' }}>{quiz.questions[currentQuestion].questionText}</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {quiz.questions[currentQuestion].options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(option)}
                                    style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: selectedOption === option
                                            ? (isCorrect ? '#00b894' : '#ff7675')
                                            : (selectedOption && option === quiz.questions[currentQuestion].correctAnswer ? '#00b894' : 'rgba(255,255,255,0.1)'),
                                        color: 'white',
                                        fontSize: '1rem',
                                        transition: '0.3s'
                                    }}
                                    disabled={!!selectedOption}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {selectedOption && (
                            <div style={{ marginTop: '1rem', height: '20px', fontWeight: 'bold', color: isCorrect ? '#00b894' : '#ff7675' }}>
                                {isCorrect ? 'Correct!' : `Incorrect! Answer: ${quiz.questions[currentQuestion].correctAnswer}`}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Quiz;
