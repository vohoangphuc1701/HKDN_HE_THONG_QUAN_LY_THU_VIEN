import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authApi from '../services/authApi';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  User,
  CreditCard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  LogIn,
  UserPlus,
  Check,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    id: '2151053001',
    label: 'Nguyễn Văn A',
    code: '2151053001',
    password: 'Matkhau@123',
    major: 'CNTT',
  },
  {
    id: 'sv2026',
    label: 'Võ Hoàng Phúc',
    code: 'sv2026',
    password: 'Matkhau@123',
    major: 'Logistics',
  },
];

const REMEMBER_LOGIN_ID_KEY = 'uth_remembered_login_id';

function readRememberedLoginId() {
  try {
    return localStorage.getItem(REMEMBER_LOGIN_ID_KEY) || '';
  } catch {
    return '';
  }
}

function writeRememberedLoginId(value) {
  try {
    if (value) {
      localStorage.setItem(REMEMBER_LOGIN_ID_KEY, value);
    } else {
      localStorage.removeItem(REMEMBER_LOGIN_ID_KEY);
    }
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
}

/**
 * AuthPageMobile - Giao diện Đăng nhập & Đăng ký chuyên biệt cho Mobile & Tablet (TV2)
 * - Thiết kế chuẩn Mobile-First (375px -> 1023px), vùng chạm >= 44px
 * - Tương thích 100% Tailwind v3.4, không dùng inline CSS, không ảnh hưởng file AuthPage của TV3
 * - Đồng bộ màu thương hiệu UTH (#00666b) và nền (#f4f8f7)
 */
export default function AuthPageMobile({ initialMode = 'login', onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};

  const [overrideMode, setOverrideMode] = useState(null);

  const mode =
    location.pathname === '/register'
      ? 'register'
      : location.pathname === '/login'
      ? 'login'
      : overrideMode || initialMode;

  const loginInputRef = useRef(null);
  const regNameInputRef = useRef(null);
  const toastTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);

  // State - Đăng nhập (ưu tiên dữ liệu vừa đăng ký chuyển sang từ /register hoặc MSSV đã ghi nhớ)
  const [loginIdentifier, setLoginIdentifier] = useState(
    () => routeState.registeredIdentifier || readRememberedLoginId() || '2151053001'
  );
  const [loginPassword, setLoginPassword] = useState(
    () => routeState.registeredPassword || 'Matkhau@123'
  );
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // State - Đăng ký
  const [regFullName, setRegFullName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // State - Tương tác & Modals
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState(() => routeState.toast || '');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 240);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMsg('');
    }, 3200);
  };

  // Tự ẩn toast chuyển sang từ trang đăng ký & dọn dẹp timer khi unmount
  useEffect(() => {
    if (routeState.toast) {
      toastTimerRef.current = setTimeout(() => {
        setToastMsg('');
      }, 3200);
    }
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [routeState.toast]);

  // Hỗ trợ phím Escape đóng nhanh mọi Modal
  useEffect(() => {
    if (!showGuideModal && !showForgotModal && !showTermsModal) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowGuideModal(false);
        setShowForgotModal(false);
        setForgotSent(false);
        setShowTermsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGuideModal, showForgotModal, showTermsModal]);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setOverrideMode(newMode);
    setErrorMsg('');
    navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCapsLockCheck = (e) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  // Kiểm tra 4 tiêu chí mật khẩu trực tiếp
  const pwdChecks = {
    minLength: regPassword.length >= 8,
    hasUpper: /[A-Z]/.test(regPassword),
    hasNumber: /[0-9]/.test(regPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(regPassword),
  };

  const calculatePasswordStrength = () => {
    if (!regPassword) {
      return { score: 0, label: '', textColor: 'text-slate-400', barColor: 'bg-slate-200' };
    }
    const score =
      Number(pwdChecks.minLength) +
      Number(pwdChecks.hasUpper) +
      Number(pwdChecks.hasNumber) +
      Number(pwdChecks.hasSpecial);

    switch (score) {
      case 1:
        return {
          score: 1,
          label: 'Mật khẩu yếu',
          textColor: 'text-red-600',
          barColor: 'bg-red-500',
        };
      case 2:
        return {
          score: 2,
          label: 'Trung bình',
          textColor: 'text-amber-600',
          barColor: 'bg-amber-500',
        };
      case 3:
        return {
          score: 3,
          label: 'Mật khẩu mạnh',
          textColor: 'text-emerald-600',
          barColor: 'bg-emerald-500',
        };
      case 4:
        return {
          score: 4,
          label: 'Rất an toàn',
          textColor: 'text-[#00666b]',
          barColor: 'bg-[#00666b]',
        };
      default:
        return {
          score: 0,
          label: 'Quá ngắn',
          textColor: 'text-red-600',
          barColor: 'bg-red-400',
        };
    }
  };

  const pwdStrength = calculatePasswordStrength();
  const isConfirmTyped = regConfirmPassword.length > 0;
  const isConfirmMatched = isConfirmTyped && regPassword === regConfirmPassword;

  // Gợi ý điền nhanh đuôi @ut.edu.vn trên bàn phím di động
  const suggestedUthEmail = (() => {
    const trimmedEmail = regEmail.trim();
    const trimmedId = regStudentId.trim();
    if (!trimmedEmail && trimmedId) {
      return `${trimmedId.toLowerCase()}@ut.edu.vn`;
    }
    if (trimmedEmail && !trimmedEmail.includes('@')) {
      return `${trimmedEmail.toLowerCase()}@ut.edu.vn`;
    }
    return '';
  })();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Vui lòng nhập mã số sinh viên hoặc email UTH.');
      loginInputRef.current?.focus();
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu tài khoản thư viện.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanId = loginIdentifier.trim();
      const res = await authApi.login({
        username: cleanId,
        password: loginPassword,
      });
      writeRememberedLoginId(rememberMe ? cleanId : '');
      const user = res?.user || {};
      showToast(
        res?.isOfflineDemo
          ? 'Đăng nhập chế độ trải nghiệm (Backend đang offline)...'
          : 'Đăng nhập thành công! Đang mở thư viện...'
      );
      if (onAuthSuccess) {
        onAuthSuccess({
          name: user.fullName || user.name || 'Nguyễn Văn A',
          studentId: user.studentId || user.username || cleanId,
          email: user.email || `${cleanId}@ut.edu.vn`,
        });
      }
      redirectTimerRef.current = setTimeout(() => {
        setIsSubmitting(false);
        navigate('/');
      }, 450);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regFullName.trim() || !regStudentId.trim() || !regEmail.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, mã số sinh viên và email (*).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setErrorMsg('Địa chỉ email sinh viên không hợp lệ (ví dụ: 2151053001@ut.edu.vn).');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMsg('Mật khẩu phải có tối thiểu 8 ký tự để đảm bảo an toàn.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }
    if (!regAgreeTerms) {
      setErrorMsg('Vui lòng tích chọn đồng ý với Điều khoản & Quy chế Thư viện UTH.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanId = regStudentId.trim();
      await authApi.register({
        username: cleanId,
        password: regPassword,
        fullName: regFullName.trim(),
        email: regEmail.trim(),
      });
      setIsSubmitting(false);
      const successMsg = 'Tạo tài khoản bạn đọc thành công! Hãy đăng nhập ngay.';
      showToast(successMsg);
      setLoginIdentifier(cleanId);
      setLoginPassword(regPassword);
      setOverrideMode('login');
      navigate('/login', {
        replace: true,
        state: {
          registeredIdentifier: cleanId,
          registeredPassword: regPassword,
          toast: successMsg,
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(
        err?.message || 'Không thể đăng ký tài khoản lúc này. Vui lòng kiểm tra lại thông tin.'
      );
    }
  };

  const handleSelectDemoAccount = (account) => {
    setLoginIdentifier(account.code);
    setLoginPassword(account.password);
    setErrorMsg('');
    showToast(`Đã điền tài khoản mẫu: ${account.label} (${account.code})`);
  };

  const openForgotPassword = () => {
    if (!forgotEmail && loginIdentifier.trim()) {
      setForgotEmail(loginIdentifier.trim());
    }
    setForgotSent(false);
    setShowForgotModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f8f7] text-slate-800 flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Họa tiết ánh sáng nền dịu mắt */}
      <div
        className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#00666b]/[0.08] via-teal-900/[0.02] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating Toast chuẩn Mobile & Tablet */}
      {toastMsg && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-4 inset-x-3.5 sm:inset-x-auto sm:top-20 sm:right-6 sm:w-96 z-50 select-none"
        >
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 text-white p-3.5 shadow-2xl border border-slate-700/80 backdrop-blur-md ring-1 ring-white/10 flex items-center gap-3">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400" />
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 block">
                Thư viện Số UTH
              </span>
              <p className="text-xs sm:text-[13px] font-bold text-white leading-snug mt-0.5">
                {toastMsg}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastMsg('')}
              aria-label="Đóng thông báo"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* ======================================================== */}
      {/* 1. TOP HEADER MOBILE & TABLET                            */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 bg-[#00666b] text-white border-b border-[#005458] shadow-sm select-none">
        <div className="max-w-xl md:max-w-2xl mx-auto h-14 sm:h-16 py-2 px-3.5 xs:px-4 sm:px-6 flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            title="Thư viện Đại học UTH"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#00666b] shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-[18px] h-[18px] text-[#00666b]" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-white tracking-tight font-heading">
                  Thư viện
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/20 text-white uppercase tracking-wider">
                  UTH
                </span>
              </div>
              <span className="text-[10px] font-medium text-teal-100/90 tracking-tight hidden xs:inline mt-0.5">
                Cổng sinh viên di động
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              aria-label="Hướng dẫn mượn sách"
              className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors cursor-pointer font-semibold text-xs p-2 sm:px-3 sm:py-1.5 rounded-xl hover:bg-white/10"
            >
              <HelpCircle className="w-4 h-4 text-teal-200 shrink-0" />
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>

            <div className="bg-[#004549] p-1 rounded-xl border border-white/15 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`px-2.5 xs:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#004f53] shadow-sm'
                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`px-2.5 xs:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-[#004f53] shadow-sm'
                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                }`}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. KHỐI CARD CHÍNH TỐI ƯU MOBILE & TABLET                */}
      {/* ======================================================== */}
      <main className="flex-1 py-4 sm:py-7 px-3.5 xs:px-4 sm:px-6 flex flex-col justify-center relative z-10">
        <div className="max-w-xl md:max-w-2xl w-full mx-auto space-y-3.5">
          {/* Thanh điều hướng quay lại & trạng thái */}
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-slate-700 hover:text-[#00666b] border border-slate-200/90 text-xs font-bold shadow-xs transition-all group cursor-pointer select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#00666b]" />
              <span>Về trang chủ thư viện</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-teal-200/70 text-[11px] font-semibold text-slate-600 shadow-xs select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden xs:inline">Trực tuyến ·</span>
              <span>3 Cơ sở UTH</span>
            </div>
          </div>

          {/* CARD XÁC THỰC TRUNG TÂM */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden ring-1 ring-slate-900/5">
            {/* Thanh điểm nhấn thương hiệu đặt độc lập không dùng Grid tránh lỗi cột */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#00666b] via-emerald-400 to-[#0d9488]" />

            {/* HERO BANNER THƯƠNG HIỆU UTH GỌN ĐẸP */}
            <div className="bg-gradient-to-br from-[#00383b] via-[#00595e] to-[#00666b] text-white p-5 sm:p-6 relative overflow-hidden select-none">
              <div
                className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute right-12 -bottom-10 w-28 h-28 rounded-full bg-emerald-400/15 blur-xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-sm">
                      <GraduationCap className="w-6 h-6 text-teal-100" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-200 block">
                        Đồng hành cùng mùa học mới
                      </span>
                      <h2 className="text-base xs:text-lg sm:text-xl font-black text-white leading-snug font-heading mt-0.5">
                        Mở sách hay, khơi nguồn tri thức.
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-teal-50 transition-colors cursor-pointer"
                  >
                    Quy trình
                  </button>
                </div>

                {/* 3 Thẻ chỉ số nhanh */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/10 border border-white/15 px-2.5 py-2 text-center backdrop-blur-sm">
                    <span className="block text-xs sm:text-sm font-black text-white tabular-nums">
                      916+
                    </span>
                    <span className="block text-[10px] text-teal-100/90 font-medium truncate">
                      Đầu sách số
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/15 px-2.5 py-2 text-center backdrop-blur-sm">
                    <span className="block text-xs sm:text-sm font-black text-white tabular-nums">
                      48 giờ
                    </span>
                    <span className="block text-[10px] text-teal-100/90 font-medium truncate">
                      Giữ đơn quầy
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/15 px-2.5 py-2 text-center backdrop-blur-sm">
                    <span className="block text-xs sm:text-sm font-black text-white tabular-nums">
                      Pick &amp; Go
                    </span>
                    <span className="block text-[10px] text-teal-100/90 font-medium truncate">
                      Quét QR nhanh
                    </span>
                  </div>
                </div>

                {/* Dải cơ sở đào tạo */}
                <div className="flex items-center gap-1.5 text-[11px] text-teal-100/90 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                  <span className="truncate">
                    CS1 Bình Thạnh · CS2 TP. Thủ Đức · CS3 Quận 12
                  </span>
                </div>
              </div>
            </div>

            {/* PHẦN NỘI DUNG FORM */}
            <div className="p-5 xs:p-6 sm:p-8 bg-white">
              {/* Thanh chuyển đổi chế độ 1 chạm trong Card */}
              <div
                role="tablist"
                aria-label="Chế độ xác thực tài khoản"
                className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 mb-5 select-none"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => switchMode('login')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-[#00666b] shadow-sm ring-1 ring-slate-900/5'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  onClick={() => switchMode('register')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-[#00666b] shadow-sm ring-1 ring-slate-900/5'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  <span>Đăng ký bạn đọc</span>
                </button>
              </div>

              {/* Thông báo lỗi nếu có */}
              {errorMsg && (
                <div
                  role="alert"
                  className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-[13px] flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="flex-1 font-medium leading-relaxed">{errorMsg}</span>
                  <button
                    type="button"
                    onClick={() => setErrorMsg('')}
                    aria-label="Ẩn thông báo lỗi"
                    className="text-red-400 hover:text-red-700 p-0.5 rounded-md cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ================================================== */}
              {/* CHẾ ĐỘ A: ĐĂNG NHẬP                                */}
              {/* ================================================== */}
              {mode === 'login' ? (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00666b] block select-none">
                      TÀI KHOẢN SINH VIÊN UTH
                    </span>
                    <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading leading-tight">
                      Chào mừng bạn trở lại!
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Đăng nhập để đặt mượn giáo trình và quản lý lịch hẹn thư viện.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="mobileLoginIdentifier"
                        className="block text-xs sm:text-[13px] font-bold text-slate-800"
                      >
                        Mã số sinh viên hoặc email{' '}
                        <span className="text-[#00666b] font-bold">*</span>
                      </label>
                      <div className="group relative rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-[#00666b] focus-within:ring-4 focus-within:ring-[#00666b]/15 transition-all bg-slate-50/40 focus-within:bg-white shadow-xs">
                        <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#00666b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          ref={loginInputRef}
                          id="mobileLoginIdentifier"
                          type="text"
                          autoComplete="username"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="VD: 2151053001 hoặc sinhvien@ut.edu.vn"
                          className="w-full pl-10 pr-9 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none font-medium"
                        />
                        {loginIdentifier && (
                          <button
                            type="button"
                            onClick={() => {
                              setLoginIdentifier('');
                              loginInputRef.current?.focus();
                            }}
                            aria-label="Xóa mã số sinh viên"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="mobileLoginPassword"
                          className="block text-xs sm:text-[13px] font-bold text-slate-800"
                        >
                          Mật khẩu <span className="text-[#00666b] font-bold">*</span>
                        </label>
                        {capsLockOn && (
                          <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Đang bật Caps Lock</span>
                          </span>
                        )}
                      </div>
                      <div className="group relative rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-[#00666b] focus-within:ring-4 focus-within:ring-[#00666b]/15 transition-all bg-slate-50/40 focus-within:bg-white shadow-xs">
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#00666b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          id="mobileLoginPassword"
                          type={showLoginPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          onKeyUp={handleCapsLockCheck}
                          onKeyDown={handleCapsLockCheck}
                          placeholder="Nhập mật khẩu tài khoản"
                          className="w-full pl-10 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs pt-0.5 select-none">
                      <label className="inline-flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-[#00666b] focus:ring-[#00666b] border-slate-300 cursor-pointer accent-[#00666b]"
                        />
                        <span>Duy trì đăng nhập</span>
                      </label>

                      <button
                        type="button"
                        onClick={openForgotPassword}
                        className="text-[#00666b] font-bold hover:underline cursor-pointer py-0.5"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full h-12 rounded-xl bg-[#00666b] hover:bg-[#005458] active:bg-[#00474b] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed select-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-[18px] h-[18px] animate-spin" />
                          <span>Đang xác thực tài khoản...</span>
                        </>
                      ) : (
                        <>
                          <span>Đăng nhập thư viện</span>
                          <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Điền nhanh tài khoản mẫu 1 chạm */}
                  <div className="rounded-2xl bg-[#f4f8f7] border border-teal-200/70 p-3.5 space-y-2.5 select-none">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00666b]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Điền nhanh tài khoản mẫu UTH</span>
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">1 chạm</span>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      {DEMO_ACCOUNTS.map((acc) => {
                        const isSelected = loginIdentifier.trim() === acc.code;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => handleSelectDemoAccount(acc)}
                            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white border-[#00666b] ring-2 ring-[#00666b]/15 shadow-xs'
                                : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-teal-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-slate-800 truncate">
                                {acc.label}
                              </span>
                              <span className="block text-[11px] font-mono text-slate-500 tabular-nums">
                                {acc.code} · {acc.major}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#00666b] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-0.5">
                    <div className="text-center text-xs sm:text-[13px] text-slate-600">
                      <span>Tân sinh viên chưa có thẻ thư viện? </span>
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="text-[#00666b] font-bold hover:underline cursor-pointer"
                      >
                        Đăng ký tài khoản ngay
                      </button>
                    </div>

                    <div className="flex items-start gap-2.5 pt-3.5 text-xs text-slate-500 border-t border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Phiên đăng nhập được bảo vệ an toàn. Không chia sẻ mật khẩu để bảo vệ quyền lợi mượn sách của bạn.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ================================================== */
                /* CHẾ ĐỘ B: ĐĂNG KÝ                                  */
                /* ================================================== */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00666b] block select-none">
                      DÀNH CHO SINH VIÊN UTH
                    </span>
                    <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading leading-tight">
                      Tạo tài khoản thư viện
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Đồng bộ giỏ sách và lịch sử mượn đọc tại cả 3 cơ sở UTH.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="mobileRegFullName"
                          className="block text-xs sm:text-[13px] font-bold text-slate-800"
                        >
                          Họ và tên sinh viên{' '}
                          <span className="text-[#00666b] font-bold">*</span>
                        </label>
                        <div className="group relative rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-[#00666b] focus-within:ring-4 focus-within:ring-[#00666b]/15 transition-all bg-slate-50/40 focus-within:bg-white shadow-xs">
                          <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#00666b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                          <input
                            ref={regNameInputRef}
                            id="mobileRegFullName"
                            type="text"
                            autoComplete="name"
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                            placeholder="VD: Nguyễn Minh Khôi"
                            className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="mobileRegStudentId"
                          className="block text-xs sm:text-[13px] font-bold text-slate-800"
                        >
                          Mã số sinh viên <span className="text-[#00666b] font-bold">*</span>
                        </label>
                        <div className="group relative rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-[#00666b] focus-within:ring-4 focus-within:ring-[#00666b]/15 transition-all bg-slate-50/40 focus-within:bg-white shadow-xs">
                          <CreditCard className="w-4 h-4 text-slate-400 group-focus-within:text-[#00666b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                          <input
                            id="mobileRegStudentId"
                            type="text"
                            autoComplete="username"
                            value={regStudentId}
                            onChange={(e) => setRegStudentId(e.target.value)}
                            placeholder="VD: 2251120045"
                            className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none font-mono font-medium tabular-nums"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label
                          htmlFor="mobileRegEmail"
                          className="block text-xs sm:text-[13px] font-bold text-slate-800"
                        >
                          Email sinh viên <span className="text-[#00666b] font-bold">*</span>
                        </label>
                        {suggestedUthEmail && (
                          <button
                            type="button"
                            onClick={() => setRegEmail(suggestedUthEmail)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 hover:bg-teal-100 text-[#00666b] border border-teal-200/80 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <span>Điền nhanh:</span>
                            <strong className="font-mono">{suggestedUthEmail}</strong>
                          </button>
                        )}
                      </div>
                      <div className="group relative rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-[#00666b] focus-within:ring-4 focus-within:ring-[#00666b]/15 transition-all bg-slate-50/40 focus-within:bg-white shadow-xs">
                        <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#00666b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          id="mobileRegEmail"
                          type="email"
                          autoComplete="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="Nhập email trường cấp (@ut.edu.vn)"
                          className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="mobileRegPassword"
                          className="block text-xs sm:text-[13px] font-bold text-slate-800"
                        >
                          Mật khẩu <span className="text-[#00666b] font-bold">*</span>
                        </label>
                        {regPassword && (
                          <span className={`text-[11px] font-bold ${pwdStrength.textColor}`}>
                            {pwdStrength.label}
                          </span>
                        )}
                      </div>

                      <div className="group relative rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-[#00666b] focus-within:ring-4 focus-within:ring-[#00666b]/15 transition-all bg-slate-50/40 focus-within:bg-white shadow-xs">
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#00666b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          id="mobileRegPassword"
                          type={showRegPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          onKeyUp={handleCapsLockCheck}
                          onKeyDown={handleCapsLockCheck}
                          placeholder="Tạo mật khẩu từ 8 ký tự trở lên"
                          className="w-full pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          aria-label={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          {showRegPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="pt-1 space-y-2 select-none">
                        <div className="flex gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`flex-1 rounded-full transition-colors ${
                                pwdStrength.score >= step ? pwdStrength.barColor : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                          <span
                            className={`inline-flex items-center gap-1.5 ${
                              pwdChecks.minLength
                                ? 'text-emerald-700 font-semibold'
                                : 'text-slate-500'
                            }`}
                          >
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${
                                pwdChecks.minLength ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>Tối thiểu 8 ký tự</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 ${
                              pwdChecks.hasUpper
                                ? 'text-emerald-700 font-semibold'
                                : 'text-slate-500'
                            }`}
                          >
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${
                                pwdChecks.hasUpper ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>Chữ in hoa (A-Z)</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 ${
                              pwdChecks.hasNumber
                                ? 'text-emerald-700 font-semibold'
                                : 'text-slate-500'
                            }`}
                          >
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${
                                pwdChecks.hasNumber ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>Chữ số (0-9)</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 ${
                              pwdChecks.hasSpecial
                                ? 'text-emerald-700 font-semibold'
                                : 'text-slate-500'
                            }`}
                          >
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${
                                pwdChecks.hasSpecial ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>Ký tự đặc biệt (@#$)</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="mobileRegConfirmPassword"
                          className="block text-xs sm:text-[13px] font-bold text-slate-800"
                        >
                          Xác nhận mật khẩu <span className="text-[#00666b] font-bold">*</span>
                        </label>
                        {isConfirmTyped && (
                          <span
                            className={`text-[11px] font-bold ${
                              isConfirmMatched ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {isConfirmMatched ? 'Mật khẩu đã khớp' : 'Mật khẩu chưa khớp'}
                          </span>
                        )}
                      </div>
                      <div
                        className={`group relative rounded-xl border transition-all bg-slate-50/40 focus-within:bg-white shadow-xs ${
                          isConfirmTyped && !isConfirmMatched
                            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/15'
                            : 'border-slate-200 hover:border-slate-300 focus-within:border-[#00666b] focus-within:ring-4 focus-within:ring-[#00666b]/15'
                        }`}
                      >
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#00666b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          id="mobileRegConfirmPassword"
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu vừa tạo"
                          className="w-full pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          aria-label={
                            showRegConfirmPassword
                              ? 'Ẩn mật khẩu xác nhận'
                              : 'Hiện mật khẩu xác nhận'
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          {showRegConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-0.5 select-none">
                      <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regAgreeTerms}
                          onChange={(e) => setRegAgreeTerms(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-[#00666b] focus:ring-[#00666b] border-slate-300 cursor-pointer accent-[#00666b] shrink-0"
                        />
                        <span className="leading-relaxed">
                          Tôi đồng ý với{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="font-bold text-[#00666b] hover:underline cursor-pointer"
                          >
                            Điều khoản mượn đọc
                          </button>{' '}
                          và{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="font-bold text-[#00666b] hover:underline cursor-pointer"
                          >
                            Chính sách bảo mật
                          </button>{' '}
                          của Thư viện UTH.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full h-12 rounded-xl bg-[#00666b] hover:bg-[#005458] active:bg-[#00474b] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed select-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-[18px] h-[18px] animate-spin" />
                          <span>Đang khởi tạo thẻ bạn đọc...</span>
                        </>
                      ) : (
                        <>
                          <span>Hoàn tất đăng ký tài khoản</span>
                          <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center text-xs sm:text-[13px] text-slate-600 pt-1">
                    <span>Đã có tài khoản sinh viên UTH? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-[#00666b] font-bold hover:underline cursor-pointer"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. BOTTOM FOOTER GỌN GÀNG                                */}
      {/* ======================================================== */}
      <footer className="py-4 px-4 sm:px-6 border-t border-slate-200/80 text-xs text-slate-500 shrink-0 bg-white/70 relative z-10 select-none">
        <div className="max-w-xl md:max-w-2xl mx-auto flex flex-col xs:flex-row items-center justify-between gap-2 text-center xs:text-left">
          <p className="font-medium">
            © <span className="tabular-nums">2026</span> Thư viện Đại học UTH
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="hover:text-[#00666b] hover:underline transition-colors cursor-pointer font-medium"
            >
              Quy chế &amp; Bảo mật
            </button>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1 hover:text-[#00666b] hover:underline transition-colors cursor-pointer font-semibold text-slate-600"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00666b]" />
              <span>Hỗ trợ</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Nút Lên đầu trang (Back-to-Top) */}
      {showBackToTop && !showGuideModal && !showForgotModal && !showTermsModal && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 right-4 z-30 w-10 h-10 rounded-full bg-[#00666b]/95 hover:bg-[#005155] text-white shadow-lg border border-white/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* MODAL HƯỚNG DẪN */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowGuideModal(false)}
          />
          <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-5 sm:p-7 space-y-4 border border-slate-100 z-10">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00666b] border border-teal-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 id="mobile-guide-title" className="text-sm sm:text-base font-bold text-slate-900">
                    Quy trình mượn sách Pick &amp; Go
                  </h3>
                  <p className="text-[11px] text-slate-500">3 bước nhận giáo trình nhanh tại quầy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Đóng hướng dẫn"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f4f8f7] border border-teal-100">
                <div className="w-6 h-6 rounded-full bg-[#00666b] text-white flex items-center justify-center shrink-0 font-bold tabular-nums">
                  1
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Đăng nhập bằng MSSV</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Sử dụng Mã số sinh viên hoặc email @ut.edu.vn để đồng bộ giỏ mượn cá nhân.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f4f8f7] border border-teal-100">
                <div className="w-6 h-6 rounded-full bg-[#00666b] text-white flex items-center justify-center shrink-0 font-bold tabular-nums">
                  2
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Đặt lịch hẹn trực tuyến</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Chọn tối đa <span className="font-bold tabular-nums">5</span> cuốn mỗi đợt mượn tại cơ sở thuận tiện nhất.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f4f8f7] border border-teal-100">
                <div className="w-6 h-6 rounded-full bg-[#00666b] text-white flex items-center justify-center shrink-0 font-bold tabular-nums">
                  3
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Quét QR nhận sách trong 48h</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Đưa mã QR trên điện thoại cho thủ thư quầy Pick &amp; Go để nhận sách ngay (BR05).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full xs:w-auto px-5 py-2.5 bg-[#00666b] text-white font-bold rounded-xl text-xs hover:bg-[#005458] transition-colors cursor-pointer"
              >
                Đã hiểu quy trình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KHÔI PHỤC MẬT KHẨU */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-forgot-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowForgotModal(false);
              setForgotSent(false);
            }}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-7 space-y-4 border border-slate-100 z-10">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 id="mobile-forgot-title" className="text-base font-bold text-slate-900">
                Khôi phục mật khẩu sinh viên
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                aria-label="Đóng cửa sổ khôi phục"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-3 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Đã gửi liên kết khôi phục</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hướng dẫn đặt lại mật khẩu đã gửi tới{' '}
                  <strong className="text-slate-900">{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="w-full py-2.5 bg-[#00666b] text-white text-xs font-bold rounded-xl hover:bg-[#005458] cursor-pointer"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmail.trim()) return;
                  setForgotSent(true);
                }}
                className="space-y-4 text-xs"
              >
                <p className="text-slate-600 leading-relaxed">
                  Nhập mã số sinh viên hoặc email @ut.edu.vn để nhận liên kết đặt lại mật khẩu.
                </p>
                <div className="space-y-1.5">
                  <label htmlFor="mobileForgotEmail" className="font-bold text-slate-800 block">
                    Mã số sinh viên hoặc Email UTH
                  </label>
                  <input
                    id="mobileForgotEmail"
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="VD: 2151053001 hoặc 2151053001@ut.edu.vn"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-[#00666b] focus:ring-4 focus:ring-[#00666b]/15 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#00666b] text-white rounded-xl font-bold hover:bg-[#005458] cursor-pointer"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL ĐIỀU KHOẢN & QUY CHẾ */}
      {showTermsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-terms-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowTermsModal(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-5 sm:p-7 space-y-4 border border-slate-100 z-10 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00666b]" />
                <h3 id="mobile-terms-title" className="text-sm sm:text-base font-bold text-slate-900">
                  Điều khoản &amp; Quy chế Thư viện UTH
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                aria-label="Đóng điều khoản"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs text-slate-600 leading-relaxed pr-1">
              <div className="p-3.5 bg-[#f4f8f7] rounded-2xl border border-teal-100 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  1. Định mức mượn tài liệu (BR01 - BR05)
                </h4>
                <p>
                  Sinh viên được mượn tối đa <strong className="tabular-nums">5</strong> cuốn trong <strong className="tabular-nums">14</strong> ngày (BR02), gia hạn trực tuyến thêm <strong className="tabular-nums">7</strong> ngày (BR03). Đơn đặt trước được giữ tại quầy <strong className="tabular-nums">48h</strong> (BR05).
                </p>
              </div>
              <div className="p-3.5 bg-[#f4f8f7] rounded-2xl border border-teal-100 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">2. Bảo quản học liệu chung</h4>
                <p>
                  Giữ nguyên vẹn mã vạch định danh và trang sách. Phí trả trễ hạn áp dụng <strong className="tabular-nums">5.000đ</strong>/cuốn/ngày (BR04).
                </p>
              </div>
              <div className="p-3.5 bg-[#f4f8f7] rounded-2xl border border-teal-100 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">3. Bảo mật dữ liệu cá nhân</h4>
                <p>
                  Thông tin sinh viên và lịch sử mượn trả chỉ phục vụ nội bộ công tác học vụ tại Trường Đại học Giao thông Vận tải TP.HCM.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 shrink-0 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2.5 bg-[#00666b] text-white font-bold rounded-xl text-xs hover:bg-[#005458] cursor-pointer"
              >
                Đồng ý &amp; Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
