import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import useMediaQuery from './hooks/useMediaQuery';

// Code-splitting các phân hệ Mobile (TV2), Desktop (TV3) và Auth
const MobileApp = lazy(() => import('./pages/MobileApp'));
const DesktopApp = lazy(() => import('./pages/DesktopApp'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

/**
 * Fallback hiển thị trong quá trình tải trang (Lazy Loading)
 */
function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] p-8 select-none">
      <div className="w-11 h-11 rounded-2xl bg-[#00666B]/10 border border-[#00666B]/20 flex items-center justify-center text-[#00666B] animate-spin mb-3">
        <RefreshCw className="w-5 h-5 stroke-[2.2]" />
      </div>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        Đang tải dữ liệu Thư viện UTH...
      </span>
      <span className="text-[11px] text-slate-400 mt-1">Vui lòng chờ trong giây lát</span>
    </div>
  );
}

function MainAppSwitcher() {
  // Tối ưu hóa Session 20: Dùng useMediaQuery để Conditional Rendering thực sự,
  // chỉ mount DesktopApp (TV3) khi >= 768px và MobileApp (TV2) khi < 768px.
  // Tránh duplicate API calls, duplicate timers và tiết kiệm 50% DOM node.
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!isDesktop) {
    return <MobileApp />;
  }

  return (
    <Routes>
      <Route path="/" element={<DesktopApp />} />
      <Route path="/books" element={<DesktopApp />} />
      <Route path="/books/:id" element={<DesktopApp />} />
      <Route path="/loans" element={<DesktopApp />} />
      <Route path="/history" element={<DesktopApp />} />
      <Route path="/checkout" element={<DesktopApp />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Trang Đăng nhập & Đăng ký theo mẫu thiết kế UTH */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Phân hệ thư viện tự động chuyển đổi theo kích thước màn hình */}
          <Route path="/*" element={<MainAppSwitcher />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
