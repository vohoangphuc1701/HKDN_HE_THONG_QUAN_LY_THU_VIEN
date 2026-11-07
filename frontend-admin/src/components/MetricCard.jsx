/*
 * Thẻ hiển thị các chỉ số thống kê tổng quan (tổng sách, đơn chờ gom, quá hạn) kèm xu hướng thay đổi.
 */
export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'blue',
}) {
  const isUp = change && change.startsWith('+')
  const isDown = change && change.startsWith('-')
  const trendClass = isUp ? 'trend--up' : isDown ? 'trend--down' : ''
  const iconColorClass = color ? `metric-card__icon--${color}` : 'metric-card__icon--blue'

  return (
    <div className="metric-card">
      {Icon && (
        <span className={`metric-card__icon ${iconColorClass}`}>
          <Icon size={20} />
        </span>
      )}

      <div className="metric-card__body">
        <p>{title}</p>
        <strong>{value}</strong>

        {change && (
          <div className={`trend ${trendClass}`}>
            {change}
            {changeLabel && <small> {changeLabel}</small>}
          </div>
        )}
      </div>
    </div>
  )
}
