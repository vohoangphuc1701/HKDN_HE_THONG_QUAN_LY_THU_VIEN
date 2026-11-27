import React from 'react';
import BookListPagePC from '../components/pages/BookListPagePC';
import BookListPageMobile from './BookListPageMobile';
import useMediaQuery from '../hooks/useMediaQuery';

/**
 * BookListPage - Component điều hướng tra cứu giáo trình thư viện UTH
 * Dùng useMediaQuery('(min-width: 768px)') để chỉ mount đúng 1 giao diện Mobile (TV2) hoặc PC (TV3).
 */
export default function BookListPage(props) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? <BookListPagePC {...props} /> : <BookListPageMobile {...props} />;
}
