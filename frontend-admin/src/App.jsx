import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import AdminRouteGuard, { RemoteScannerGuard } from './components/AdminRouteGuard'

const DashboardOverviewPage = lazy(() => import('./pages/DashboardOverviewPage'))
const InventoryManagementPage = lazy(() => import('./pages/InventoryManagementPage'))
const OrderWorkflowPage = lazy(() => import('./pages/OrderWorkflowPage'))
const FineTrackingPage = lazy(() => import('./pages/FineTrackingPage'))
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'))
const ScanStationPage = lazy(() => import('./pages/ScanStationPage'))

function ScannerRemoteView() {
  return (
    <section className="empty-state" aria-labelledby="scanner-title">
      <span className="empty-state__icon"><QrCode size={28} /></span>
      <h2 id="scanner-title">Giao diện máy quét di động</h2>
      <p>Máy quét từ xa đã sẵn sàng nhận mã phiên quét từ trạm quầy laptop.</p>
    </section>
  )
}

/*
  Dinh tuyen he thong quan tri thu vien UTH.
  Tich hop Route Guard bao ve cac route thu thu va phan quyen truy cap may quet di dong.
*/
export default function App() {
  return (
    <Suspense fallback={<div className="route-loading">Đang tải dữ liệu...</div>}>
      <Routes>
        {/* Route may quet tu xa tren dien thoai duoc bao ve boi RemoteScannerGuard */}
        <Route
          path="scanner-remote"
          element={
            <RemoteScannerGuard>
              <ScannerRemoteView />
            </RemoteScannerGuard>
          }
        />

        {/* Cac route chuc nang quan tri tren desktop duoc bao ve boi AdminRouteGuard */}
        <Route
          element={
            <AdminRouteGuard>
              <AdminLayout />
            </AdminRouteGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverviewPage />} />
          <Route path="inventory" element={<InventoryManagementPage />} />
          <Route path="orders" element={<OrderWorkflowPage />} />
          <Route path="fines" element={<FineTrackingPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="scan-station" element={<ScanStationPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
