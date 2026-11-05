/*
 * Thẻ hiển thị các chỉ số tổng quan kèm xu hướng tăng giảm cho Dashboard.
 */
export default function MetricCard({ title, value, change, changeLabel, icon: Icon }) {
  const isUp = change && change.startsWith('+')
  const isDown = change && change.startsWith('-')
  const trendClass = isUp ? 'trend--up' : isDown ? 'trend--down' : ''

  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <span className="metric-card__title">{title}</span>
        {Icon && (
          <span className="metric-card__icon">
            <Icon size={20} />
          </span>
        )}
      </div>
      <div className="metric-card__value">{value}</div>
      {change && (
        <div className="metric-card__footer">
          <span className={`metric-card__trend ${trendClass}`}>{change}</span>
          {changeLabel && <span className="metric-card__label"> {changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
