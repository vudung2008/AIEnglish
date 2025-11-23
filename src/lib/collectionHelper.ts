export interface Flashcard {
    front: any;
    key: string;
    ipa: string;
    pos: string;
    context: string;
    transContext: string;
    mean: string;
}

export interface Collection {
    id: string;
    name: string;
    flashcards: Flashcard[];
}

const COLLECTION_KEY = "collections";

// Lấy tất cả collection
export const getCollections = (): Collection[] => {
    const json = localStorage.getItem(COLLECTION_KEY);
    if (!json) return [];
    try {
        return JSON.parse(json) as Collection[];
    } catch {
        return [];
    }
};

// Lưu collection mới
export const saveCollection = (name: string, flashcards: Flashcard[]): void => {
    const collections = getCollections();
    const id = Date.now().toString();
    collections.push({ id, name, flashcards });
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections));
};

// Cập nhật collection (thêm flashcards)
export const updateCollection = (id: string, flashcards: Flashcard[]) => {
    const collections = getCollections();
    const idx = collections.findIndex(c => c.id === id);
    if (idx >= 0) {
        collections[idx].flashcards = flashcards;
        localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections));
    }
};

// Xóa collection
export const deleteCollection = (id: string) => {
    const collections = getCollections().filter(c => c.id !== id);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections));
};

export const deleteCardByIndex = (collectionId: string, index: number) => {
    const collections = getCollections();
    const idx = collections.findIndex(c => c.id === collectionId);

    if (idx === -1) return;
    if (index < 0 || index >= collections[idx].flashcards.length) return;

    collections[idx].flashcards.splice(index, 1);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections));
};

// Thêm flashcards vào collection
export const addFlashcardsToCollection = (id: string, newCards: Flashcard[]) => {
    const collections = getCollections();
    const idx = collections.findIndex(c => c.id === id);
    if (idx >= 0) {
        collections[idx].flashcards.push(...newCards);
        localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections));
    }
};
