import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import AdminLayout from './components/AdminLayout'

const DashboardOverviewPage = lazy(() => import('./pages/DashboardOverviewPage'))
const InventoryManagementPage = lazy(() => import('./pages/InventoryManagementPage'))
const OrderWorkflowPage = lazy(() => import('./pages/OrderWorkflowPage'))
const FineTrackingPage = lazy(() => import('./pages/FineTrackingPage'))
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'))

function ScannerPlaceholder({ title, description }) {
  return (
    <section className="empty-state" aria-labelledby="scanner-title">
      <span className="empty-state__icon"><QrCode size={28} /></span>
      <h2 id="scanner-title">{title}</h2>
      <p>{description}</p>
    </section>
  )
}

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading">Đang tải dữ liệu...</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverviewPage />} />
          <Route path="inventory" element={<InventoryManagementPage />} />
          <Route path="orders" element={<OrderWorkflowPage />} />
          <Route path="fines" element={<FineTrackingPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route
            path="scan-station"
            element={<ScannerPlaceholder title="Trạm quét tại quầy" description="Khu vực này sẽ được tích hợp module quét QR của TV5." />}
          />
          <Route
            path="scanner-remote"
            element={<ScannerPlaceholder title="Máy quét từ xa" description="Route đã sẵn sàng để TV5 gắn giao diện quét trên điện thoại." />}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
