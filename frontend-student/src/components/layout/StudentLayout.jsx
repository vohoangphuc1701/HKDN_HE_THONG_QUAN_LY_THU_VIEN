import React from 'react';
import NavbarPC from './NavbarPC';
import FooterPC from './FooterPC';

const StudentLayout = ({
  children,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="min-h-screen bg-[#f0f5f3] flex flex-col font-sans selection:bg-[#e0eff0] selection:text-[#00666B] overflow-x-clip relative">
      {/* Background ambient lighting layers to eliminate sterile white emptiness */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[450px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,102,107,0.12),transparent)] -z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-[450px] h-[550px] bg-[radial-gradient(ellipse_60%_40%_at_85%_25%,rgba(13,148,136,0.06),transparent)] -z-10" />

      {/* Top Navigation Bar (PC) */}
      <NavbarPC
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area - Mở rộng chiều rộng tối đa 1560px để khắc phục khoảng trống 2 bên */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {children}
      </main>

      {/* Footer Hoàn chỉnh Thư viện UTH */}
      <FooterPC setActiveTab={setActiveTab} onOpenCart={onOpenCart} />
    </div>
  );
};

export default StudentLayout;
