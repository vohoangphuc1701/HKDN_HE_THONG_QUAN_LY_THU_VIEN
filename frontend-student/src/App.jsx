import React from 'react';
import StudentLayout from './components/layout/StudentLayout';
import { UserCheck, BookOpen, Clock, AlertCircle } from 'lucide-react';

function App() {
    return (
        <StudentLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Khu vực chào mừng sinh viên tinh gọn, thanh lịch theo chuẩn UI/UX */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-7 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-13 h-13 rounded-lg bg-[#00666B] text-white flex items-center justify-center font-heading font-extrabold text-lg shrink-0 shadow-xs">
                                VA
                            </div>
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#e0eff0] text-[#00666B] text-[11px] font-bold mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00666B]" />
                                    <span>Sinh viên chính quy • Khoa Công nghệ Thông tin</span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                                    Xin chào, Nguyễn Văn A (MSSV: 2151053001)
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cổng Dịch Vụ Thư Viện — Trường Đại học Giao thông Vận tải TP.HCM (UTH)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Thẻ thư viện hợp lệ</span>
                            </div>
                        </div>
                    </div>

                    {/* Tóm tắt chỉ số nhanh tài khoản thư viện sinh viên */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                            <div className="w-10 h-10 rounded-md bg-[#e0eff0] text-[#00666B] flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-medium">Sách đang mượn</p>
                                <p className="text-base font-bold text-slate-900 mt-0.5">
                                    3 <span className="text-xs font-normal text-slate-500">/ 5 cuốn</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                            <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-medium">Hạn trả gần nhất</p>
                                <p className="text-base font-bold text-amber-700 mt-0.5">
                                    05/11/2026 <span className="text-xs font-normal text-amber-600">(còn 2 ngày)</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                            <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-medium">Nợ phạt & vi phạm</p>
                                <p className="text-base font-bold text-emerald-700 mt-0.5">
                                    0 đ <span className="text-xs font-normal text-emerald-600">(Không nợ)</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

export default App;
