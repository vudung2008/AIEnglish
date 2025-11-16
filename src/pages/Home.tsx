import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white text-gray-900">

            {/* Hero Section */}
            <section className="flex flex-col items-center text-center max-w-3xl mx-auto mt-20 animate-fadeIn">
                <h1 className="text-5xl md:text-6xl font-bold text-blue-600 mb-4 animate-slideUp">
                    AIEnglish
                </h1>
                <p className="text-gray-700 text-lg md:text-xl mb-6 animate-slideUp delay-150">
                    Học tiếng Anh thông minh hơn với AI. Luyện từ vựng, flashcards và câu ví dụ theo ngữ cảnh thực tế.
                </p>
                <div className="flex gap-4 justify-center flex-wrap animate-slideUp delay-300">
                    <Link
                        to="/learn"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition"
                    >
                        Bắt đầu học
                    </Link>
                    <Link
                        to="/flashcards"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-3 rounded-xl transition"
                    >
                        Flashcards
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="mt-20 max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
                <div className="p-6 border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl will-change-transform will-change-shadow animate-fadeIn delay-150">
                    <h2 className="text-xl font-semibold text-blue-600 mb-2">Từ vựng theo ngữ cảnh</h2>
                    <p className="text-gray-600">
                        Học từ mới bằng câu ví dụ thực tế, dễ nhớ và áp dụng ngay.
                    </p>
                </div>
                <div className="p-6 border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl will-change-transform will-change-shadow animate-fadeIn delay-150">
                    <h2 className="text-xl font-semibold text-blue-600 mb-2">Flashcards thông minh</h2>
                    <p className="text-gray-600">
                        Ôn tập nhanh, AI tự đề xuất từ cần luyện dựa trên tiến độ của bạn.
                    </p>
                </div>
                <div className="p-6 border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl will-change-transform will-change-shadow animate-fadeIn delay-150">
                    <h2 className="text-xl font-semibold text-blue-600 mb-2">Tích hợp AI</h2>
                    <p className="text-gray-600">
                        Tạo câu, kiểm tra ngữ pháp, luyện nói và viết với AI trực tiếp trên web.
                    </p>
                </div>
            </section>

            {/* How it works Section */}
            <section className="mt-20 max-w-4xl mx-auto text-center space-y-10">
                <h2 className="text-3xl font-bold text-blue-600 animate-slideUp">AIEnglish hoạt động thế nào?</h2>
                <div className="grid md:grid-cols-3 gap-8 animate-fadeIn delay-200">
                    <div className="p-6 border border-gray-100 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
                        <div className="text-4xl mb-3">📝</div>
                        <h3 className="text-xl font-semibold mb-2">Tạo câu ví dụ</h3>
                        <p className="text-gray-600 text-sm">
                            AI tạo câu ví dụ với từ mới, theo ngữ cảnh thực tế giúp bạn dễ nhớ.
                        </p>
                    </div>
                    <div className="p-6 border border-gray-100 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="text-xl font-semibold mb-2">Ôn tập thông minh</h3>
                        <p className="text-gray-600 text-sm">
                            Flashcards AI đề xuất từ cần học dựa trên tiến độ và tần suất sai.
                        </p>
                    </div>
                    <div className="p-6 border border-gray-100 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
                        <div className="text-4xl mb-3">🤖</div>
                        <h3 className="text-xl font-semibold mb-2">Hỗ trợ AI trực tiếp</h3>
                        <p className="text-gray-600 text-sm">
                            Luyện nói, viết, kiểm tra ngữ pháp với AI ngay trên web, không cần app.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-20 mb-10 text-gray-400 text-sm text-center">
                © 2025 AIEnglish. All rights reserved.
            </footer>

            {/* Tailwind animation classes */}
            <style>
                {`
          .animate-fadeIn { animation: fadeIn 0.8s ease forwards; opacity: 0; }
          .animate-slideUp { animation: slideUp 0.8s ease forwards; opacity: 0; }
          .animate-slideUp.delay-150 { animation-delay: 0.15s; }
          .animate-slideUp.delay-300 { animation-delay: 0.3s; }
          .animate-fadeIn.delay-100 { animation-delay: 0.1s; }
          .animate-fadeIn.delay-200 { animation-delay: 0.2s; }
          .animate-fadeIn.delay-300 { animation-delay: 0.3s; }
          @keyframes fadeIn { to { opacity: 1; } }
          @keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        `}
            </style>
        </div>
    );
};

export default Home;
