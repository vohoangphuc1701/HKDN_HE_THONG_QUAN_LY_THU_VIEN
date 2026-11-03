import React from 'react';
import NavbarPC from './NavbarPC';

const StudentLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#e0eff0] selection:text-[#00666B] overflow-x-clip">
            {/* Top Navigation Bar (PC) */}
            <NavbarPC />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer Thư viện UTH */}
            <footer className="bg-white border-t border-slate-200 text-slate-500 text-center py-4 text-xs mt-auto">
                &copy; 2026 Thư viện Trường Đại học Giao thông Vận tải TP.HCM (UTH). All rights reserved.
            </footer>
        </div>
    );
};

export default StudentLayout;
