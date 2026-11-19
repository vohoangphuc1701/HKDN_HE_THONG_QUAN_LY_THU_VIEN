import React from 'react';
import CheckoutSchedulePagePC from './CheckoutSchedulePagePC';
import CheckoutSchedulePageMobile from './CheckoutSchedulePageMobile';

/**
 * CheckoutSchedulePage - Màn hình Xác nhận Đơn mượn & Đặt lịch hẹn Pick & Go Thư viện UTH
 * - Tự động hiển thị CheckoutSchedulePagePC trên màn hình máy tính & tablet (Desktop md >= 768px - TV3)
 * - Tự động hiển thị CheckoutSchedulePageMobile trên điện thoại (Mobile < 768px - TV2)
 */
export default function CheckoutSchedulePage(props) {
  if (props.mode) {
    return <CheckoutSchedulePageMobile {...props} />;
  }

  return (
    <>
      <div className="md:hidden">
        <CheckoutSchedulePageMobile {...props} />
      </div>
      <div className="hidden md:block">
        <CheckoutSchedulePagePC {...props} />
      </div>
    </>
  );
}
