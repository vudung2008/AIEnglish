/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState, useEffect } from 'react';
import { type Collection, getCollections, saveCollection, deleteCollection } from '../lib/collectionHelper';
import { testKey } from '../lib/apiClient';

/**
 * Hàm ẩn API key: giữ 2 ký tự đầu và cuối, phần giữa dấu * 
 */
const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 4) return '*'.repeat(key.length);
    const start = key.slice(0, 2);
    const end = key.slice(-2);
    const middle = '*'.repeat(key.length - 4);
    return `${start}${middle}${end}`;
};

const GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-pro",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
];

function ModelSelect() {
    const DEFAULT_MODEL = "gemini-1.5-flash";

    const [model, setModel] = useState(DEFAULT_MODEL);

    useEffect(() => {
        const saved = localStorage.getItem("gemini:model");

        // Nếu đã có model trong localStorage thì dùng cái đó
        if (saved) {
            setModel(saved);
        } else {
            // Nếu không có thì lưu giá trị mặc định
            localStorage.setItem("gemini:model", DEFAULT_MODEL);
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
        const value = e.target.value;
        setModel(value);
        localStorage.setItem("gemini:model", value);
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium">Chọn model Gemini:</label>

            <select
                value={model}
                onChange={handleChange}
                className="
                    px-4 py-3 border border-gray-300 rounded-xl 
                    bg-gray-50 text-gray-700 shadow-sm 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:bg-gray-100 transition cursor-pointer
                "
            >
                {GEMINI_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>

            <p className="text-sm text-blue-600 mt-1">
                Model đang chọn: <span className="font-mono">{model}</span>
            </p>
        </div>
    );
}

const Settings = () => {
    // -----------------------
    // API Key State
    // -----------------------
    const api_key = useRef<HTMLInputElement>(null);
    const [key, setKey] = useState<string | null>(() => window.localStorage.getItem('api_key'));

    // -----------------------
    // Collection State
    // -----------------------
    const [collections, setCollections] = useState<Collection[]>(() => getCollections());
    const [newCollectionName, setNewCollectionName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [openPopup, setOpenPopup] = useState(false);
    const [activeCollection, setActiveCollection] = useState<Collection | null>(null);

    // Khi click show button
    const handleShowCollection = (col: Collection) => {
        setActiveCollection(col); // lưu collection hiện tại
        setOpenPopup(true);       // mở popup
    };

    // Khi đóng popup
    const handleClosePopup = () => {
        setOpenPopup(false);
        setActiveCollection(null);
    };

    // -----------------------
    // API Key Handlers
    // -----------------------
    const handleSubmitApiKey = async () => {
        const value = api_key.current?.value;
        if (value) {
            const a = await testKey(value);
            if (a) {
                window.localStorage.setItem('api_key', value);
                setKey(value);
                if (api_key.current) {
                    api_key.current.value = '';
                }
                alert('Tạo API key thành công!');
            }
        }
    };

    const handleDeleteApiKey = () => {
        window.localStorage.removeItem('api_key');
        setKey(null);
        alert('Xóa API key thành công!');
    };

    // -----------------------
    // Collection Handlers
    // -----------------------

    const refreshCollections = () => setCollections(getCollections());

    // Tạo Collection mới
    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) {
            alert('Tên collection không được để trống');
            return;
        }
        saveCollection(newCollectionName, []);
        setNewCollectionName('');
        refreshCollections();
        alert('Tạo collection thành công!');
    };

    // Xóa Collection
    const handleDeleteCollection = (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa collection này?')) return;
        deleteCollection(id);
        refreshCollections();
    };

    // Export collection ra file JSON
    const handleExportCollection = (col: Collection) => {
        const blob = new Blob([JSON.stringify(col, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${col.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import collection từ file JSON
    const handleImportCollection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string) as Collection;
                saveCollection(json.name || 'Imported Collection', json.flashcards || []);
                refreshCollections();
                alert('Import collection thành công!');
            } catch (err) {
                alert('File không hợp lệ!');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // reset input
    };

    return (
        <div className="max-w-5xl mx-auto p-6 flex flex-col gap-10">
            {/* -----------------------
          API Key Section
      ----------------------- */}
            <div className="p-6 border border-gray-200 rounded-xl shadow-md bg-white">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">Quản lý API Key Gemini</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        ref={api_key}
                        type="text"
                        placeholder="Nhập API key của bạn"
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                    <button
                        onClick={handleSubmitApiKey}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                    >
                        Nhập
                    </button>
                    <button
                        onClick={handleDeleteApiKey}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                    >
                        Xóa Key
                    </button>
                </div>
                {key && (
                    <p className="mt-4 text-gray-700">
                        API key hiện tại: <span className="font-mono break-all">{maskKey(key)}</span>
                    </p>
                )}
            </div>

            <div className="p-6 border border-gray-200 rounded-xl shadow-md bg-white">
                <ModelSelect />
            </div>

            {/* -----------------------
          Collection Section
      ----------------------- */}
            <div className="p-6 border border-gray-200 rounded-xl shadow-md bg-white">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">Quản lý Collections</h2>

                {/* Tạo Collection mới */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                    <input
                        type="text"
                        placeholder="Tên collection mới"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                    />
                    <button
                        onClick={handleCreateCollection}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
                    >
                        Tạo Collection
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                    >
                        Import Collection
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json"
                        className="hidden"
                        onChange={handleImportCollection}
                    />
                </div>

                {/* Danh sách Collection */}
                {collections.length === 0 ? (
                    <p className="text-gray-500">Chưa có collection nào.</p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {collections.map((col) => (
                            <div key={col.id} className="border border-gray-300 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 p-4 flex flex-col gap-2 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-blue-600">{col.name}</h3>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => handleExportCollection(col)}
                                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition shadow-sm"
                                        >
                                            Export
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCollection(col.id)}
                                            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition shadow-sm"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => handleShowCollection(col)}
                                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition shadow-sm"
                                        >Show</button>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm">{col.flashcards.length} flashcards</p>

                                {/* Hiển thị flashcards */}
                                {/* {col.flashcards.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 border-t border-gray-200 pt-2">
                                        {col.flashcards.map((card, idx) => (
                                            <div
                                                key={idx}
                                                className="p-2 border border-gray-200 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
                                            >
                                                <h4 className="font-semibold text-blue-600">
                                                    {card.key} - {card.mean}
                                                </h4>
                                                <p className="text-gray-700 text-sm">{card.context}</p>
                                                <p className="text-gray-400 text-xs italic">{card.transContext}</p>
                                            </div>
                                        ))}
                                    </div>
                                )} */}
                            </div>
                        ))}
                    </div>
                )}
                {openPopup && activeCollection && (
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
                        onClick={handleClosePopup}
                    >
                        <div
                            className="bg-white border border-gray-200 rounded-xl p-6 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto relative shadow-2xl animate-popup"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Nút X */}
                            <button
                                onClick={handleClosePopup}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
                            >
                                ✕
                            </button>

                            <h2 className="text-2xl font-bold text-blue-600 mb-4">{activeCollection.name}</h2>

                            {activeCollection.flashcards.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeCollection.flashcards.map((card, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 border border-gray-200 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 bg-white"
                                        >
                                            <h4 className="font-semibold text-blue-600">{card.key} - {card.mean}</h4>
                                            <p className="text-gray-700 text-sm">{card.context}</p>
                                            <p className="text-gray-400 text-xs italic">{card.transContext}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Collection này chưa có flashcards.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Thêm style Tailwind custom */}
                <style>
                    {`
@keyframes popupFade {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-popup {
  animation: popupFade 0.15s ease-out forwards;
}
`}
                </style>




            </div>
        </div>
    );
};

export default Settings;
