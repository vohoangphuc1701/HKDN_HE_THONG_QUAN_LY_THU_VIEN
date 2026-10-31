import React from 'react';

const StudentLayout = ({ children }) => {
    return (
        // min-h-screen giúp khung luôn bao phủ toàn bộ chiều cao màn hình
        // flex và flex-col để chia bố cục theo chiều dọc
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* 1. Vùng Header */}
            <header className="bg-white shadow p-4">
                <h1 className="text-xl font-bold text-blue-700">Hệ thống Quản lý Thư viện - TV3</h1>
            </header>

            {/* 2. Vùng Nội dung chính (Hiển thị các trang khác nhau) */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4">
                {children}
            </main>

            {/* 3. Vùng Footer */}
            <footer className="bg-gray-800 text-white text-center p-3 text-sm">
                &copy; 2026 University Library Management System
            </footer>

        </div>
    );
};

export default StudentLayout;