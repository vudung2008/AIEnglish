/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import {
    getCollections,
    addFlashcardsToCollection,
    type Collection,
    type Flashcard
} from '../lib/collectionHelper';
import { getContextAndSave } from '../lib/apiClient';
import ReactMarkdown from 'react-markdown';

const Learn = () => {
    const [collections, setCollections] = useState(getCollections());
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(collections[0] || null);

    const [wordsInput, setWordsInput] = useState('');
    const [loading, setLoading] = useState(false);

    // ❌ remove flashcards state completely
    const flashcards = selectedCollection?.flashcards || [];

    const handleGenerate = async () => {
        if (loading) return;
        if (!wordsInput.trim()) return alert("Nhập từ vựng muốn học");

        setLoading(true);

        try {
            const words = wordsInput
                .split(',')
                .map(w => w.trim())
                .filter(Boolean);

            const newCards = await getContextAndSave(words);

            if (selectedCollection) {
                addFlashcardsToCollection(selectedCollection.id, newCards);

                // Refresh collections from storage
                const updatedCollections = getCollections();
                setCollections(updatedCollections);

                // Update selected collection reference
                const updated = updatedCollections.find(c => c.id === selectedCollection.id) || null;
                setSelectedCollection(updated);
            }

            setWordsInput('');
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        }

        setLoading(false);
    };

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
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base"
                    placeholder="Nhập từ mới, cách nhau bằng dấu ,"
                    value={wordsInput}
                    onChange={e => setWordsInput(e.target.value)}
                />

                <button
                    disabled={loading}
                    className={`px-4 py-3 rounded-xl text-white text-base font-medium transition w-full md:w-auto
                        ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
                    `}
                    onClick={handleGenerate}
                >
                    {loading ? "Đang tạo..." : "Tạo với AI"}
                </button>
            </div>

            {/* Notice */} <div className='text-center text-gray-400' > <p>Nên tạo với 10-15 từ để tránh quá tải và hết lượt request trong ngày!</p> <p>Nếu bạn thấy lượt request bất thường, hãy xóa api_key tại <a className='text-blue-500 text underline underline-offset-4' href="https://aistudio.google.com/api-keys" target="_blank"> AIStudioGoogle </a></p> </div>

            {/* Flashcards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                {flashcards.map((card, idx) => (
                    <div
                        key={idx}
                        className="p-4 border border-gray-200 rounded-xl shadow bg-white 
                                   hover:shadow-lg transition transform hover:-translate-y-1"
                    >
                        <div className="text-xl font-bold text-blue-600 break-words">
                            {card.key}
                        </div>

                        <div className="italic text-gray-500 text-sm mb-1">
                            {card.pos} | {card.ipa}
                        </div>

                        <p className="mt-2 text-gray-700 text-base leading-relaxed break-words">
                            <ReactMarkdown>{card.context}</ReactMarkdown>
                        </p>

                        <p className="mt-1 text-gray-500 italic text-sm break-words">
                            <ReactMarkdown>{card.transContext}</ReactMarkdown>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Learn;
