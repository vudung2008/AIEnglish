/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState } from 'react';
import { type Collection, getCollections, saveCollection, deleteCollection } from '../lib/collectionHelper';

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

    // -----------------------
    // API Key Handlers
    // -----------------------
    const handleSubmitApiKey = () => {
        const value = api_key.current?.value;
        if (value) {
            window.localStorage.setItem('api_key', value);
            setKey(value);
            alert('Tạo API key thành công!');
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
                        API key hiện tại: <span className="font-mono">{maskKey(key)}</span>
                    </p>
                )}
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
                    <div className="grid md:grid-cols-2 gap-6">
                        {collections.map((col) => (
                            <div key={col.id} className="border border-gray-300 rounded-xl shadow p-4 flex flex-col gap-2 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-blue-600">{col.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleExportCollection(col)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded-xl hover:bg-blue-700 transition"
                                        >
                                            Export
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCollection(col.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded-xl hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm">{col.flashcards.length} flashcards</p>

                                {/* Hiển thị flashcards */}
                                {col.flashcards.length > 0 && (
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
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
