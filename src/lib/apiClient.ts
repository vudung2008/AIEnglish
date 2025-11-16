import { GoogleGenAI } from '@google/genai';
import { type Flashcard } from './collectionHelper';

const ai = () => {
    const apiKey = window.localStorage.getItem('api_key') || '';
    return new GoogleGenAI({ apiKey });
};

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

/**
 * Gọi AI để tạo quiz trắc nghiệm từ danh sách keys
 */
export const generateQuizFromKeys = async (keys: string[]): Promise<QuizQuestion[]> => {
    if (!keys || keys.length === 0) return [];

    const pattern = {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    };

    const content = `
${JSON.stringify(pattern)}. Write a JSON array based on these keys: [${keys.join(", ")}]. 
Each object must be a **multiple-choice question** (4 options, one correct) but the question can take different forms:
- Normal question (e.g., "What is the meaning of 'apple'?")(Vietnamese-English)
- Fill-in-the-blank (e.g., "I like to eat ____ every day.")
- Context-based question using the key in a sentence

Each object must contain:
- "question": the question text
- "options": an array of 4 options including the correct answer
- "correctAnswer": the index (0-3) of the correct answer in "options"

Return **strict JSON array** only. Do not include any markdown, code block, or text outside JSON.
`.trim();


    const res = await ai().models.generateContent({
        contents: content,
        model: 'gemini-2.5-flash', // có thể thay model khác
    });

    try {
        let text = res.text || '[]';
        // Loại bỏ ```json nếu AI trả về
        text = text.replace(/```json|```/g, '').trim();
        return JSON.parse(text) as QuizQuestion[];
    } catch (err) {
        console.error("AI response parse error:", err, res.text);
        return [];
    }
};


// Gọi AI để tạo từ vựng + ngữ cảnh
export const getContextAndSave = async (words: string[]): Promise<Flashcard[]> => {
    if (!words || words.length === 0) return [];

    const pattern = {
        key: '',
        ipa: '',
        pos: '',
        context: '',
        transContext: '',
        mean: ''
    };
    const content = `${JSON.stringify(pattern)}. Write a json array based on these words: [${words.join(",")}]. Each object must contain "key", "ipa" (international phonetic), "pos" (part of speech), "context" (easy sentence using the word), "transContext" (Vietnamese translation), "mean" (Vietnamese meaning). "Key" is in "context" and "transContext" marked down **. Return **strict JSON array** only.`;

    const res = await ai().models.generateContent({
        contents: content,
        model: 'gemini-2.5-flash',
    });

    try {
        let text = res.text || '[]';
        // Remove ```json if AI trả về
        text = text.replace(/```json|```/g, '').trim();
        return JSON.parse(text) as Flashcard[];
    } catch (err) {
        console.error("AI response parse error:", err, res.text);
        return [];
    }
};
