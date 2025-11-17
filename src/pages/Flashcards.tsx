import { useState, useEffect, useRef } from 'react';
import { getCollections, type Collection, type Flashcard } from '../lib/collectionHelper';
import ReactMarkdown from 'react-markdown';

const Flashcards = () => {
    const collections = getCollections();
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(collections[0] || null);
    const [cards, setCards] = useState<Flashcard[]>(selectedCollection?.flashcards || []);
    const [order, setOrder] = useState<number[]>([]);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [cardHeight, setCardHeight] = useState<number | null>(null);

    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    const shuffle = (arr: number[]) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    useEffect(() => {
        if (selectedCollection) {
            const list = selectedCollection.flashcards || [];
            setCards(list);
            if (list.length > 0) {
                setOrder(shuffle(list.map((_, i) => i)));
                setIndex(0);
                setFlipped(false);
            }
        }
    }, [selectedCollection]);

    const handleNext = () => {
        setFlipped(false);
        if (index + 1 >= order.length) {
            setOrder(shuffle(order));
            setIndex(0);
        } else {
            setIndex(prev => prev + 1);
        }
    };

    useEffect(() => {
        // tính max height mặt trước + sau
        if (frontRef.current && backRef.current) {
            const maxHeight = Math.max(frontRef.current.scrollHeight, backRef.current.scrollHeight);
            setCardHeight(maxHeight);
        }
    }, [cards, index]);

    if (!selectedCollection) return <div className="p-6">Chưa có collection nào.</div>;
    if (cards.length === 0) return <div className="p-6">Collection này chưa có từ vựng.</div>;
    if (order.length === 0 || order[index] === undefined) return <div className="p-6">Đang tải...</div>;

    const card = cards[order[index]];
    if (!card) return <div className="p-6">Đang tải...</div>;

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
                onClick={() => setFlipped(!flipped)}
                style={{ height: cardHeight ? `${cardHeight}px` : 'auto' }}
            >
                <div className={`relative duration-500 transform-style-preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>

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
                        <p className="mt-2 text-gray-600"><span><ReactMarkdown>{card.context}</ReactMarkdown></span></p>
                        <p className="mt-1 text-gray-400 italic"><span><ReactMarkdown>{card.transContext}</ReactMarkdown></span></p>
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
