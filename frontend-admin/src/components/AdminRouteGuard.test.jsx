import { render, screen } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AdminRouteGuard, { RemoteScannerGuard } from './AdminRouteGuard'

describe('AdminRouteGuard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('chan truy cap va hien thi yeu cau dang nhap khi chua co token', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AdminRouteGuard>
          <div>Protected Admin Content</div>
        </AdminRouteGuard>
      </MemoryRouter>
    )

    expect(screen.getByText('Yêu cầu quyền Quản trị thư viện')).toBeInTheDocument()
    expect(screen.queryByText('Protected Admin Content')).not.toBeInTheDocument()
  })

  it('cho phep truy cap khi da dang nhap voi token hop le', () => {
    localStorage.setItem('token', 'fake_admin_jwt_token')

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AdminRouteGuard>
          <div>Protected Admin Content</div>
        </AdminRouteGuard>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Admin Content')).toBeInTheDocument()
    expect(screen.queryByText('Yêu cầu quyền Quản trị thư viện')).not.toBeInTheDocument()
  })

  it('tu choi truy cap khi tai khoan mang vai tro STUDENT khong co quyen Admin', () => {
    localStorage.setItem('token', 'fake_student_token')
    localStorage.setItem('user', JSON.stringify({ username: '2251120145', role: 'STUDENT' }))

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AdminRouteGuard>
          <div>Protected Admin Content</div>
        </AdminRouteGuard>
      </MemoryRouter>
    )

    expect(screen.getByText('Từ chối quyền truy cập')).toBeInTheDocument()
    expect(screen.queryByText('Protected Admin Content')).not.toBeInTheDocument()
  })

  it('kiem thu RemoteScannerGuard chan truy cap /scanner-remote khi khong co ma phien', () => {
    render(
      <MemoryRouter initialEntries={['/scanner-remote']}>
        <RemoteScannerGuard>
          <div>Remote Mobile Scanner Content</div>
        </RemoteScannerGuard>
      </MemoryRouter>
    )

    expect(screen.getByText('Yêu cầu mã phiên quét hợp lệ')).toBeInTheDocument()
    expect(screen.queryByText('Remote Mobile Scanner Content')).not.toBeInTheDocument()
  })

  it('kiem thu RemoteScannerGuard cho phep truy cap /scanner-remote khi co session tren URL', () => {
    render(
      <MemoryRouter initialEntries={['/scanner-remote?session=SCAN-8A2F9C']}>
        <RemoteScannerGuard>
          <div>Remote Mobile Scanner Content</div>
        </RemoteScannerGuard>
      </MemoryRouter>
    )

    expect(screen.getByText('Remote Mobile Scanner Content')).toBeInTheDocument()
  })
})
