import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import MetricCard from '../components/MetricCard'
import statsApi from '../services/statsApi'

/* Đăng ký các mô-đun cần thiết của Chart.js để vẽ biểu đồ */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

/*
 * Trang tổng quan điều hành thư viện hiển thị các chỉ số KPI, biểu đồ Chart.js và đơn cần xử lý.
 */
export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState(null)
  const [weeklyActivity, setWeeklyActivity] = useState(null)
  const [categoryShare, setCategoryShare] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [metricData, activityData, shareData, ordersData] = await Promise.all([
          statsApi.getMetrics(),
          statsApi.getWeeklyActivity(),
          statsApi.getCategoryShare(),
          statsApi.getRecentOrders(),
        ])

        setMetrics(metricData)
        setWeeklyActivity(activityData)
        setCategoryShare(shareData)
        setRecentOrders(ordersData)
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang tổng quan:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  /* Cấu hình dữ liệu cho biểu đồ cột mượn trả sách theo tuần */
  const barChartData = {
    labels: weeklyActivity?.labels || ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
    datasets: [
      {
        label: 'Sách mượn',
        data: weeklyActivity?.borrowed || [45, 62, 58, 80, 95, 70, 30],
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
      {
        label: 'Sách trả',
        data: weeklyActivity?.returned || [38, 48, 52, 65, 82, 60, 25],
        backgroundColor: '#93c5fd',
        borderRadius: 6,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: { size: 11 },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
        grid: { color: '#f3f4f6' },
      },
      x: {
        ticks: { font: { size: 10 } },
        grid: { display: false },
      },
    },
  }

  /* Cấu hình dữ liệu cho biểu đồ tròn phân bổ thể loại sách */
  const doughnutChartData = {
    labels: categoryShare?.labels || ['CNTT', 'Logistics', 'Cầu đường', 'Kinh tế', 'Khác'],
    datasets: [
      {
        data: categoryShare?.datasets || [38, 26, 18, 12, 6],
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: { size: 10 },
          padding: 12,
        },
      },
    },
    cutout: '65%',
  }

  if (loading) {
    return <div className="route-loading">Đang tải dữ liệu tổng quan...</div>
  }

  return (
    <div className="dashboard-container">
      {/* 4 thẻ thống kê KPI tổng quan */}
      <section className="metric-grid" aria-label="Các chỉ số thư viện">
        <MetricCard
          title="Tổng đầu sách"
          value={metrics?.totalBooks?.value || '12.480'}
          change={metrics?.totalBooks?.change || '+4,8%'}
          changeLabel={metrics?.totalBooks?.changeLabel || 'so với tháng trước'}
          icon={BookOpen}
          color="blue"
        />
        <MetricCard
          title="Đơn chờ gom sách"
          value={metrics?.pendingOrders?.value || '18 đơn'}
          change={metrics?.pendingOrders?.change || '+5 đơn'}
          changeLabel={metrics?.pendingOrders?.changeLabel || 'cần chuẩn bị gấp'}
          icon={ClipboardList}
          color="orange"
        />
        <MetricCard
          title="Sách đang mượn"
          value={metrics?.activeBorrows?.value || '1.240'}
          change={metrics?.activeBorrows?.change || '+12%'}
          changeLabel={metrics?.activeBorrows?.changeLabel || 'tăng trưởng mượn'}
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          title="Đơn quá hạn"
          value={metrics?.overdueOrders?.value || '6 đơn'}
          change={metrics?.overdueOrders?.change || '-2 đơn'}
          changeLabel={metrics?.overdueOrders?.changeLabel || 'so với tuần trước'}
          icon={AlertCircle}
          color="violet"
        />
      </section>

      {/* Khu vực 2 biểu đồ Chart.js */}
      <section className="dashboard-grid" style={{ marginTop: '16px' }} aria-label="Biểu đồ thống kê">
        <div className="panel">
          <div className="panel__header">
            <div>
              <h2>Lưu lượng mượn và trả sách theo tuần</h2>
              <p>Thống kê số lượng sách giao và nhận theo từng ngày trong tuần</p>
            </div>
          </div>
          <div className="chart">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div>
              <h2>Phân bổ thể loại tài liệu</h2>
              <p>Tỷ lệ tài liệu được mượn nhiều nhất tại thư viện UTH</p>
            </div>
          </div>
          <div className="chart chart--compact">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </section>

      {/* Bảng danh sách đơn mượn cần tiếp nhận & xử lý */}
      <section className="panel" style={{ marginTop: '16px' }} aria-label="Đơn mượn cần xử lý">
        <div className="panel__header">
          <div>
            <h2>Đơn mượn cần tiếp nhận & chuẩn bị sách</h2>
            <p>Danh sách các đơn sinh viên hẹn nhận sách hôm nay</p>
          </div>
          <Link to="/orders" className="text-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Xem toàn bộ <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>SINH VIÊN</th>
                <th>TÀI LIỆU</th>
                <th>KHUNG GIỜ NHẬN</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.student}</td>
                  <td>{order.bookTitle}</td>
                  <td>{order.pickupTime}</td>
                  <td>
                    <span className={`status ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
