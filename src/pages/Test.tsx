// components/Test.tsx
import { useState, useEffect } from 'react';
import { getCollections, type Collection } from '../lib/collectionHelper';
import { generateQuizFromKeys, type QuizQuestion } from '../lib/apiClient';

interface TestResult {
    collectionId: string;
    score: number;
    total: number;
    date: string;
}

interface QuizCardProps {
    question: QuizQuestion;
    selectedOption: number | null;
    onSelect: (idx: number) => void;
    disable: boolean;
    index: number;
    total: number;
}

const QuizCard = ({ question, selectedOption, onSelect, disable, index, total }: QuizCardProps) => {
    return (
        <div className="p-6 border border-gray-300 rounded-xl shadow-lg bg-white flex flex-col gap-4">
            <p className="text-gray-500 font-semibold">Câu {index + 1} / {total}</p>
            <h3 className="text-xl font-bold text-blue-600">{question.question}</h3>
            <div className="flex flex-col gap-3 mt-2">
                {question.options.map((opt, idx) => {
                    const isCorrect = question.correctAnswer === idx;
                    let borderColor = 'border-gray-300';
                    if (selectedOption !== null) {
                        borderColor = isCorrect
                            ? 'border-green-500'
                            : selectedOption === idx
                                ? 'border-red-500'
                                : 'border-gray-300';
                    }
                    return (
                        <button
                            key={idx}
                            disabled={disable}
                            onClick={() => onSelect(idx)}
                            className={`text-left px-4 py-3 border-2 rounded-xl ${selectedOption === idx ? 'bg-gray-100' : ''} ${borderColor}`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Hàm đảo mảng
const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// Đảo options nhưng giữ đúng correctAnswer
const shuffleQuestionOptions = (question: QuizQuestion): QuizQuestion => {
    const options = [...question.options];
    const correct = question.correctAnswer;
    const optionPairs = options.map((opt, idx) => ({ opt, idx }));
    const shuffledPairs = shuffleArray(optionPairs);

    const newOptions = shuffledPairs.map(p => p.opt);
    const newCorrectIndex = shuffledPairs.findIndex(p => p.idx === correct);

    return { ...question, options: newOptions, correctAnswer: newCorrectIndex };
};

const Test = () => {
    const [collections] = useState<Collection[]>(getCollections());
    const [selectedCollection, setSelectedCollection] = useState<string>('');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<TestResult[]>([]);

    const collection = collections.find(c => c.id === selectedCollection);

    useEffect(() => {
        const stored = localStorage.getItem('test_history');
        if (stored) setHistory(JSON.parse(stored));
    }, []);

    const saveHistory = (result: TestResult) => {
        const newHistory = [result, ...history];
        localStorage.setItem('test_history', JSON.stringify(newHistory));
        setHistory(newHistory);
    };

    const handleStartTest = async () => {
        if (!collection) return;
        setLoading(true);
        try {
            const keys = collection.flashcards.map(f => f.key);
            let questions = await generateQuizFromKeys(keys);

            // Shuffle questions
            questions = shuffleArray(questions);

            // Shuffle options của từng câu
            questions = questions.map(shuffleQuestionOptions);

            setQuiz(questions);
            setCurrentIndex(0);
            setSelectedOption(null);
            setScore(0);
        } catch (err) {
            alert('Không thể tạo bài kiểm tra!');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (idx: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(idx);
        const isCorrect = quiz[currentIndex].correctAnswer === idx;
        if (isCorrect) setScore(prev => prev + 1);
    };

    const handleNext = () => {
        if (currentIndex + 1 < quiz.length) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
        } else {
            saveHistory({
                collectionId: collection!.id,
                score,
                total: quiz.length,
                date: new Date().toLocaleString(),
            });
            setQuiz([]);
        }
    };

    const handleDeleteHistory = (idx: number) => {
        const newHistory = [...history];
        newHistory.splice(idx, 1);
        localStorage.setItem('test_history', JSON.stringify(newHistory));
        setHistory(newHistory);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-blue-600">Quiz kiểm tra từ vựng</h2>

            <select
                value={selectedCollection}
                onChange={e => {
                    setSelectedCollection(e.target.value);
                    setQuiz([]);
                    setCurrentIndex(0);
                    setSelectedOption(null);
                    setScore(0);
                }}
                className="border border-gray-300 rounded-xl px-4 py-2"
            >
                <option value="">Chọn collection</option>
                {collections.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>

            {collection && !quiz.length && (
                <button
                    onClick={handleStartTest}
                    disabled={loading}
                    className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl"
                >
                    {loading ? 'Đang tạo quiz...' : 'Bắt đầu quiz'}
                </button>
            )}

            {quiz.length > 0 && currentIndex < quiz.length && (
                <QuizCard
                    question={quiz[currentIndex]}
                    selectedOption={selectedOption}
                    onSelect={handleSelectOption}
                    disable={selectedOption !== null}
                    index={currentIndex}
                    total={quiz.length}
                />
            )}

            {selectedOption !== null && currentIndex < quiz.length && (
                <button
                    onClick={handleNext}
                    className="self-end mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl"
                >
                    {currentIndex + 1 === quiz.length ? 'Hoàn thành' : 'Tiếp'}
                </button>
            )}

            {quiz.length === 0 && score > 0 && (
                <div className="mt-4 text-green-700 font-semibold text-lg">
                    Bạn hoàn thành quiz! Điểm: {score} / {currentIndex + 1}
                </div>
            )}

            {history.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-3">Lịch sử làm quiz</h3>
                    <ul className="flex flex-col gap-3">
                        {history.map((h, idx) => {
                            const col = collections.find(c => c.id === h.collectionId);
                            return (
                                <li
                                    key={idx}
                                    className="border p-4 rounded-2xl bg-gray-50 flex justify-between items-center"
                                >
                                    <div>
                                        <span className="font-semibold">{col?.name || 'Unknown Collection'}</span> -{' '}
                                        <span>{h.score}/{h.total}</span> - <span>{h.date}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteHistory(idx)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-xl"
                                    >
                                        Xóa
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Test;
