import React from 'react';
import BookListPagePC from '../components/pages/BookListPagePC';
import BookListPageMobile from './BookListPageMobile';

/**
 * BookListPage - Component điều hướng tra cứu giáo trình thư viện UTH
 * - Tự động hiển thị BookListPagePC trên màn hình máy tính & tablet (Desktop md >= 768px - TV3)
 * - Tự động hiển thị BookListPageMobile trên điện thoại (Mobile < 768px - TV2)
 */
export default function BookListPage(props) {
  return (
    <>
      <div className="md:hidden">
        <BookListPageMobile {...props} />
      </div>
      <div className="hidden md:block">
        <BookListPagePC {...props} />
      </div>
    </>
  );
}
