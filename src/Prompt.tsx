import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

export default function PromptForm() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    // **CHỈ DÙNG LOCAL TEST**: API key sẽ lộ ra
    const ai = new GoogleGenAI({
        apiKey: 'AIzaSyBz5CiUkm-MoAwh7nJsTNZlpPAHQoxQS-U',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResponse("");

        try {
            const result = await ai.models.generateContent({
                model: "gemini-2.0-flash-001",
                contents: prompt,
            });
            const rawText = result.text;
            const cleanText = rawText.replace(/^```[\w]*\n?/, "").replace(/```$/, "");
            setResponse(cleanText);
        } catch (err) {
            console.error(err);
            setResponse("Lỗi khi gọi API");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-4 border rounded">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Nhập prompt..."
                    className="w-full p-2 border rounded mb-2"
                    rows={4}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    {loading ? "Đang gửi..." : "Gửi"}
                </button>
            </form>

            {response && (
                <div className="mt-4 p-2 border rounded bg-gray-100">
                    <strong>Response:</strong>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
}
