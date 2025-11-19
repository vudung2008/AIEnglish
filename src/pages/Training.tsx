import { useState, useEffect } from "react";
import { getCollections, type Collection } from "../lib/collectionHelper";
import { generateQuizWithTypeQuestion, type QuizQuestion } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";

interface TestResult {
    collectionId: string;
    questionType: string;
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

const QuizCard = ({ question, selectedOption, onSelect, disable, index, total }: QuizCardProps) => (
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

const Training = () => {
    const [collections] = useState<Collection[]>(getCollections());
    const [selectedCollection, setSelectedCollection] = useState<string>('');
    const [questionType, setQuestionType] = useState<'mean' | 'fillblank' | 'conjunction' | ''>('');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<TestResult[]>([]);
    const [step, setStep] = useState(1);

    const collection = collections.find(c => c.id === selectedCollection);
    const navigate = useNavigate();
    // Load history từ localStorage
    useEffect(() => {
        if (collections.length <= 0) {
            alert('Vui lòng tạo 1 collection mới!');
            navigate('/settings');
            return;
        }
        if (!window.localStorage.getItem('api_key')) {
            alert('Vui lòng nhập api_key!');
            navigate('/settings');
            return;
        }
        const stored = localStorage.getItem('training_history');
        if (stored) setHistory(JSON.parse(stored));
    }, []);

    // Quay lại step khi xóa giá trị
    useEffect(() => { if (!selectedCollection) setStep(1); }, [selectedCollection]);
    useEffect(() => { if (!questionType && step > 1) setStep(1); }, [questionType]);

    const saveHistory = (result: TestResult) => {
        const newHistory = [result, ...history];
        localStorage.setItem('training_history', JSON.stringify(newHistory));
        setHistory(newHistory);
    };

    const handleStartTraining = async () => {
        if (!collection || !questionType) return;
        setLoading(true);
        try {
            console.log(questionType)
            const keys = collection.flashcards.map(f => f.key);
            let questions = await generateQuizWithTypeQuestion(keys, questionType);
            console.log(questions);
            // Shuffle questions
            questions = shuffleArray(questions);

            // Shuffle options của từng câu
            questions = questions.map(shuffleQuestionOptions);
            setQuiz(questions);
            setCurrentIndex(0);
            setSelectedOption(null);
            setScore(0);
        } catch (err) {
            alert('Không thể tạo bài luyện!');
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
                questionType,
                score,
                total: quiz.length,
                date: new Date().toLocaleString(),
            });
            setQuiz([]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-blue-600">Luyện tập từ vựng</h2>

            {/* STEP 1: Chọn collection */}
            <select
                value={selectedCollection}
                onChange={e => { setSelectedCollection(e.target.value); setStep(e.target.value ? 2 : 1); setQuiz([]); setCurrentIndex(0); setSelectedOption(null); setScore(0); }}
                className="border border-gray-300 rounded-xl px-4 py-2"
            >
                <option value="">-- Chọn collection --</option>
                {collections.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>

            {/* STEP 2: Chọn loại câu hỏi */}
            {step >= 2 && (
                <select
                    value={questionType}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={e => { setQuestionType(e.target.value as any); setStep(e.target.value ? 3 : 2); setQuiz([]); setCurrentIndex(0); setSelectedOption(null); setScore(0); }}
                    className="border border-gray-300 rounded-xl px-4 py-2 mt-2"
                >
                    <option value="">-- Chọn loại câu hỏi --</option>
                    <option value="mean">Chọn nghĩa đúng</option>
                    <option value="fillblank">Điền ô trống</option>
                    {/* <option value="conjunction">Nối từ</option> */}
                </select>
            )}

            {/* STEP 3: Bắt đầu luyện */}
            {step >= 3 && !quiz.length && (
                <button
                    onClick={handleStartTraining}
                    disabled={loading}
                    className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl"
                >
                    {loading ? 'Đang tạo bài...' : 'Bắt đầu luyện'}
                </button>
            )}

            {/* Quiz */}
            {quiz.length > 0 && currentIndex < quiz.length && (
                <>
                    <QuizCard
                        question={quiz[currentIndex]}
                        selectedOption={selectedOption}
                        onSelect={handleSelectOption}
                        disable={selectedOption !== null}
                        index={currentIndex}
                        total={quiz.length}
                    />
                    {selectedOption !== null && (
                        <button
                            onClick={handleNext}
                            className="self-end mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl"
                        >
                            {currentIndex + 1 === quiz.length ? 'Hoàn thành' : 'Tiếp'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default Training;
