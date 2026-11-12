import { render, screen } from '@testing-library/react'
import { BookOpen } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import MetricCard from './MetricCard'

describe('MetricCard', () => {
  it('hiển thị chỉ số và mức thay đổi', () => {
    render(
      <MetricCard
        title="Tổng đầu sách"
        value="12.480"
        change="+4,8%"
        changeLabel="so với tháng trước"
        icon={BookOpen}
      />,
    )

    expect(screen.getByText('Tổng đầu sách')).toBeInTheDocument()
    expect(screen.getByText('12.480')).toBeInTheDocument()
    expect(screen.getByText(/\+4,8%/)).toHaveClass('trend--up')
  })
})
