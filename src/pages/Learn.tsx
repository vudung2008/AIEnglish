/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import {
    getCollections,
    addFlashcardsToCollection,
    type Collection,
    type Flashcard
} from '../lib/collectionHelper';
import { getContextAndSave } from '../lib/apiClient';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const Learn = () => {
    const [collections, setCollections] = useState<Collection[]>(getCollections());
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(collections[0] || null);
    const [loading, setLoading] = useState(false);

    const wordsInputRef = useRef<HTMLInputElement>(null);

    const flashcards: Flashcard[] = selectedCollection?.flashcards || [];

    const handleGenerate = async () => {
        if (loading) return;
        const input = wordsInputRef.current?.value.trim();
        if (!input) return alert("Nhập từ vựng muốn học");

        setLoading(true);

        try {
            const words = input
                .split(',')
                .map(w => w.trim())
                .filter(Boolean);

            const newCards: Flashcard[] = await getContextAndSave(words);

            if (selectedCollection) {
                addFlashcardsToCollection(selectedCollection.id, newCards);

                // Refresh collections from storage
                const updatedCollections: Collection[] = getCollections();
                setCollections(updatedCollections);

                // Update selected collection reference
                const updated: Collection | null = updatedCollections.find(c => c.id === selectedCollection.id) || null;
                setSelectedCollection(updated);
            }

            if (wordsInputRef.current) wordsInputRef.current.value = '';
        } catch (err) {
            console.error(err);
            // alert("Có lỗi xảy ra. Vui lòng thử lại.");
        }

        setLoading(false);
    };

    const navigate = useNavigate();
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
    }, [])

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600 text-center">
                Học từ vựng theo ngữ cảnh
            </h1>

            {/* Chọn collection */}
            <div className="flex justify-center">
                <select
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full max-w-[280px] text-base"
                    value={selectedCollection?.id || ''}
                    onChange={e => {
                        const col = collections.find(c => c.id === e.target.value) || null;
                        setSelectedCollection(col);
                    }}
                >
                    {collections.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Input từ mới */}
            <div className="flex flex-col md:flex-row gap-3">
                <input
                    ref={wordsInputRef}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base"
                    placeholder="Nhập từ mới, cách nhau bằng dấu ,"
                />

                <button
                    disabled={loading}
                    className={`px-4 py-3 rounded-xl text-white text-base font-medium transition w-full md:w-auto
                        ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                    onClick={handleGenerate}
                >
                    {loading ? "Đang tạo..." : "Tạo với AI"}
                </button>
            </div>

            {/* Notice */}
            <div className='text-center text-gray-400'>
                <p>Nên tạo với 10-15 từ để tránh quá tải và hết lượt request trong ngày!</p>
                <p>Nếu bạn thấy lượt request bất thường, hãy xóa api_key tại <a className='text-blue-500 underline underline-offset-4' href="https://aistudio.google.com/api-keys" target="_blank"> AIStudioGoogle </a></p>
            </div>

            {/* Flashcards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                {flashcards.map((card, idx) => (
                    <div
                        key={idx}
                        className="p-4 border border-gray-200 rounded-xl shadow bg-white 
                                   hover:shadow-lg transition transform hover:-translate-y-1"
                    >
                        <div className="text-xl font-bold text-blue-600 break-words">{card.key}</div>
                        <div className="italic text-gray-500 text-sm mb-1">{card.pos} | {card.ipa}</div>
                        <p className="mt-2 text-gray-700 text-base leading-relaxed break-words">
                            <span><ReactMarkdown>{card.context}</ReactMarkdown></span>
                        </p>
                        <p className="mt-1 text-gray-500 italic text-sm break-words">
                            <span><ReactMarkdown>{card.transContext}</ReactMarkdown></span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Learn;
