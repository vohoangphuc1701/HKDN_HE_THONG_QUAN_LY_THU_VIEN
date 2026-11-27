import React from 'react';
import CheckoutSchedulePagePC from './CheckoutSchedulePagePC';
import CheckoutSchedulePageMobile from './CheckoutSchedulePageMobile';
import useMediaQuery from '../hooks/useMediaQuery';

/**
 * CheckoutSchedulePage - Màn hình Xác nhận Đơn mượn & Đặt lịch hẹn Pick & Go Thư viện UTH
 * Dùng useMediaQuery('(min-width: 768px)') để chỉ mount đúng 1 giao diện Mobile (TV2) hoặc PC (TV3).
 */
export default function CheckoutSchedulePage(props) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (props.mode || !isDesktop) {
    return <CheckoutSchedulePageMobile {...props} />;
  }

  return <CheckoutSchedulePagePC {...props} />;
}
