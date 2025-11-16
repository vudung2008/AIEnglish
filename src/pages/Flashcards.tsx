// pages/Flashcards.tsx
import { useState, useEffect, useRef } from 'react';
import { getCollections, type Collection, type Flashcard } from '../lib/collectionHelper';
import ReactMarkdown from 'react-markdown';

interface FlashcardsState {
    cards: Flashcard[];
    order: number[];
    index: number;
    flipped: boolean;
    cardHeight: number | null;
}

const Flashcards = () => {
    const collections = getCollections();
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(collections[0] || null);
    const [state, setState] = useState<FlashcardsState>({
        cards: selectedCollection?.flashcards || [],
        order: selectedCollection?.flashcards.map((_, i) => i) || [],
        index: 0,
        flipped: false,
        cardHeight: null,
    });

    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    // Hàm shuffle
    const shuffle = (arr: number[]) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    // Cập nhật khi đổi collection
    useEffect(() => {
        if (!selectedCollection) return;
        const list = selectedCollection.flashcards || [];
        const newOrder = shuffle(list.map((_, i) => i));
        setState({
            cards: list,
            order: newOrder,
            index: 0,
            flipped: false,
            cardHeight: null,
        });
    }, [selectedCollection]);

    // Tính max height mặt trước + sau
    useEffect(() => {
        if (!frontRef.current || !backRef.current) return;
        const maxHeight = Math.max(frontRef.current.scrollHeight, backRef.current.scrollHeight);
        if (state.cardHeight !== maxHeight) {
            setState(prev => ({ ...prev, cardHeight: maxHeight }));
        }
    }, [state.cards, state.index]);

    const handleNext = () => {
        if (state.index + 1 >= state.order.length) {
            const newOrder = shuffle(state.order);
            setState(prev => ({ ...prev, order: newOrder, index: 0, flipped: false }));
        } else {
            setState(prev => ({ ...prev, index: prev.index + 1, flipped: false }));
        }
    };

    if (!selectedCollection) return <div className="p-6">Chưa có collection nào.</div>;
    if (state.cards.length === 0) return <div className="p-6">Collection này chưa có từ vựng.</div>;
    if (state.order.length === 0 || state.order[state.index] === undefined) return <div className="p-6">Đang tải...</div>;

    const card = state.cards[state.order[state.index]];

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gray-50">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">Flashcards</h1>

            <div className="flex justify-center mb-6">
                <select
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full max-w-[120px] text-base"
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

            <button
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
                onClick={handleNext}
            >
                Next
            </button>

            <div
                className="w-full md:w-96 cursor-pointer perspective mt-6"
                onClick={() => setState(prev => ({ ...prev, flipped: !prev.flipped }))}
                style={{ height: state.cardHeight ? `${state.cardHeight}px` : 'auto' }}
            >
                <div className={`relative duration-500 transform-style-preserve-3d ${state.flipped ? 'rotate-y-180' : ''}`}>
                    {/* FRONT */}
                    <div
                        ref={frontRef}
                        className="bg-white border border-gray-300 rounded-xl shadow-xl flex flex-col justify-center items-center p-6 backface-hidden break-words"
                    >
                        <div className="text-3xl font-bold text-blue-600">{card.key}</div>
                        <div className="italic text-gray-500 mt-2">{card.pos} | {card.ipa}</div>
                    </div>

                    {/* BACK */}
                    <div
                        ref={backRef}
                        className="absolute top-0 left-0 w-full bg-white border border-gray-300 rounded-xl shadow-xl flex flex-col justify-center items-center p-6 backface-hidden break-words"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <div className="text-xl font-semibold text-gray-700">{card.mean}</div>
                        <p className="mt-2 text-gray-600"><ReactMarkdown>{card.context}</ReactMarkdown></p>
                        <p className="mt-1 text-gray-400 italic"><ReactMarkdown>{card.transContext}</ReactMarkdown></p>
                    </div>
                </div>
            </div>

            <style>{`
        .perspective { perspective: 1200px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
      `}</style>
        </div>
    );
};

export default Flashcards;
