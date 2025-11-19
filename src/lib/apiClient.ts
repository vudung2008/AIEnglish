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
- max 50 questions

Return **strict JSON array** only. Do not include any markdown, code block, or text outside JSON.
`.trim();

    try {
        const res = await ai().models.generateContent({
            contents: content,
            model: localStorage.getItem('gemini:model') || '', // có thể thay model khác
        });

        let text = res.text || '[]';
        // Loại bỏ ```json nếu AI trả về
        text = text.replace(/```json|```/g, '').trim();
        return JSON.parse(text) as QuizQuestion[];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err.status == 503) {
            alert('Vui lòng kiểm tra lại api_key hoặc thay đổi model AI!');
        }
        if (err.status == 429) {
            alert('Request quá tải, vui lòng thử lại sau!');
        }
        if (err.status == 500) {
            alert('Lỗi AI!');
        }
        if (err.status == 0) {
            alert('Lỗi mạng!');
        }
        if (err.status == 404) {
            alert('Model không khả dụng!');
        }
        if (err.status == 413 || err.status == 504) {
            alert('Token quá lớn, vui lòng sử dụng token nhỏ hơn!');
        }
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
    const content = `${JSON.stringify(pattern)}. For each word in [${words.join(",")}], generate:
- "key": the English word,
- "ipa": international phonetic,
- "pos": part of speech,
- "context": an easy sentence using the word in English,
- "transContext: Vietnamese translation of "context", the translation of "key" is in bold
- "mean": Vietnamese meaning of the word (just the word, not explanation).

Return **strict JSON array** only.`;

    try {
        const res = await ai().models.generateContent({
            contents: content,
            model: localStorage.getItem('gemini:model') || '',
        });

        let text = res.text || '[]';
        text = text.replace(/```json|```/g, '').trim();
        return JSON.parse(text) as Flashcard[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err.status == 503) alert('Vui lòng kiểm tra lại api_key hoặc thay đổi model AI!');
        if (err.status == 429) alert('Request quá tải, vui lòng thử lại sau!');
        if (err.status == 500) alert('Lỗi AI!');
        if (err.status == 0) alert('Lỗi mạng!');
        if (err.status == 404) alert('Model không khả dụng!');
        if (err.status == 413 || err.status == 504) alert('Token quá lớn, vui lòng sử dụng token nhỏ hơn!');
        return [];
    }
};


export const testKey = async (apiKey: string): Promise<boolean> => {
    try {
        const genai = new GoogleGenAI({ apiKey });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await genai.models.list();
        console.log("API key OK!");
        return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("API key invalid:", err);
        if (err.status == 400) {
            alert('API_KEY không đúng định dạng!');
        }
        return false;
    }
}

export const generateQuizWithTypeQuestion = async (keys: string[], type: string): Promise<QuizQuestion[]> => {
    if (!keys || keys.length === 0) return [];

    const pattern = {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    };

    const content = `
${JSON.stringify(pattern)}. Write a JSON array based on these keys: ${JSON.stringify(keys)}.
Each object must be a "multiple-choice question" (4 options, one correct).

${type === "mean"
            ? `Rules for "mean" type:
1. Each question must be either English or Vietnamese.
2. If the question is English, the 4 options must be Vietnamese meanings.
3. If the question is Vietnamese, the 4 options must be English words.
4. Include the "key" word in the correct answer.
5. Mix in some unrelated words for difficulty.
6. Do NOT write any answer in the same language as the question.
7. For each key, provide a small example sentence showing the meaning. Example:
   Key: "apple"
   Question: "What is the meaning of 'apple'?"
   Options: ["táo", "cam", "nho", "dứa"]
   CorrectAnswer: 0`
            : `Rules for "fillblank" type:
1. Each question must be a sentence with a blank ("____") where the key should be.
2. The correct answer is the missing key.
3. Include 3 incorrect options (distractors), which can be some keys from the same collection or unrelated words.
4. Sentences should use familiar, everyday contexts to make them easy to remember.
5. Ensure the blank sentence is grammatically correct.
6. For each key, provide an example sentence with the key in context. Example:
   Key: "apple"
   Question: "I like to eat ____ every day."
   Options: ["apple", "orange", "banana", "grape"]
   CorrectAnswer: 0`
        }

Each object must contain:
- "question": question text
- "options": array of 4 options including correct answer
- "correctAnswer": index (0-3) of correct answer
- maximum 50 questions

Return **strict JSON array only**, no markdown, no extra text.
`.trim();



    try {
        const res = await ai().models.generateContent({
            contents: content,
            model: localStorage.getItem('gemini:model') || '', // có thể thay model khác
        });

        let text = res.text || '[]';
        // Loại bỏ ```json nếu AI trả về
        text = text.replace(/```json|```/g, '').trim();
        return JSON.parse(text) as QuizQuestion[];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err.status == 503) {
            alert('Vui lòng kiểm tra lại api_key hoặc thay đổi model AI!');
        }
        if (err.status == 429) {
            alert('Request quá tải, vui lòng thử lại sau!');
        }
        if (err.status == 500) {
            alert('Lỗi AI!');
        }
        if (err.status == 0) {
            alert('Lỗi mạng!');
        }
        if (err.status == 404) {
            alert('Model không khả dụng!');
        }
        if (err.status == 413 || err.status == 504) {
            alert('Token quá lớn, vui lòng sử dụng token nhỏ hơn!');
        }
        return [];
    }
}