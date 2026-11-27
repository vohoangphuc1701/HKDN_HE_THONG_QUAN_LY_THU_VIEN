import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AdminRouteGuard, { RemoteScannerGuard } from './components/AdminRouteGuard'

const DashboardOverviewPage = lazy(() => import('./pages/DashboardOverviewPage'))
const InventoryManagementPage = lazy(() => import('./pages/InventoryManagementPage'))
const OrderWorkflowPage = lazy(() => import('./pages/OrderWorkflowPage'))
const FineTrackingPage = lazy(() => import('./pages/FineTrackingPage'))
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'))
const ScanStationPage = lazy(() => import('./pages/ScanStationPage'))
const RemoteScannerPage = lazy(() => import('./pages/RemoteScannerPage'))

/*
  Dinh tuyen chinh cua he thong quan ly thu vien admin.
  Bao gom cac trang quan ly kho, luong don, nhat ky, tien phat,
  tram quet tai quay va giao dien tay quet khong day tren trinh duyet di dong.
*/
export default function App() {
  return (
    <Suspense fallback={<div className="route-loading">Đang tải dữ liệu...</div>}>
      <Routes>
        {/* Giao dien doc lap danh cho trinh duyet dien thoai di dong */}
        <Route path="scanner-remote" element={<RemoteScannerPage />} />

        {/* Khung bo cuc quan tri Admin Layout cho thu thu tren may tinh */}
        <Route element={<AdminLayout />}>
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
