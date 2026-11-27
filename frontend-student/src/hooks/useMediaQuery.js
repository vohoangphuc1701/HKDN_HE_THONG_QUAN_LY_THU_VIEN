import { useState, useEffect } from 'react';

/**
 * Custom Hook kiểm tra Breakpoint Media Query (vd: '(min-width: 768px)')
 * Phục vụ Conditional Rendering sạch cho TV3 (Desktop) và TV2 (Mobile),
 * loại bỏ việc mount trùng lặp cả 2 ứng dụng gây hao tổn tài nguyên.
 * 
 * @param {string} query - CSS Media Query
 * @returns {boolean} - true nếu màn hình khớp với media query
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return true; // Mặc định hiển thị Desktop cho SSR/fallback
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const updateMatch = (e) => setMatches(e.matches);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', updateMatch);
    } else {
      mediaQueryList.addListener(updateMatch);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', updateMatch);
      } else {
        mediaQueryList.removeListener(updateMatch);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
