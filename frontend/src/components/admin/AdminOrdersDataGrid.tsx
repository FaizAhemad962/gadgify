import { type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { Chip, Select, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { AdminDataGrid } from './AdminDataGrid'
import type { Order } from '../../types'
import { formatDate } from '../../utils/dateFormatter'

interface AdminOrdersDataGridProps {
  orders: Order[]
  isLoading?: boolean
  total: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onStatusChange: (orderId: string, newStatus: Order['status']) => void
}

export const AdminOrdersDataGrid = ({
  orders,
  isLoading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onStatusChange,
}: AdminOrdersDataGridProps) => {
  const { t } = useTranslation()

  const getPaymentStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: Record<string, any> = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'error',
    }
    return colors[status] || 'default'
  }

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t('payment.pending'),
      COMPLETED: t('payment.completed'),
      FAILED: t('payment.failed'),
    }
    return statusMap[status] || status
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: t('admin.orderId'),
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#42a5f5', fontWeight: '600' }}>
          #{params.value?.substring(0, 8)}
        </span>
      ),
    },
    {
      field: 'user',
      headerName: t('admin.customer'),
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#e0e0e0' }}>
          {params.row.user?.name || 'N/A'}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: t('admin.date'),
      minWidth: 120,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#b0b0b0' }}>
          {formatDate(params.value, t)}
        </span>
      ),
    },
    {
      field: 'items',
      headerName: t('admin.items'),
      minWidth: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#b0b0b0', fontWeight: '500' }}>
          {params.row.items?.length || 0}
        </span>
      ),
    },
    {
      field: 'total',
      headerName: t('admin.total'),
      minWidth: 110,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#ff9800', fontWeight: '700' }}>
          ₹{params.value?.toLocaleString()}
        </span>
      ),
    },
    {
      field: 'hsn',
      headerName: 'HSN',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#a0a0a0' }}>
          {params.row.hsn || 'N/A'}
        </span>
      ),
    },
    {
      field: 'gst',
      headerName: 'GST',
      minWidth: 80,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#a0a0a0' }}>
          {params.row.gst ? `${params.row.gst}%` : 'N/A'}
        </span>
      ),
    },
    {
      field: 'paymentStatus',
      headerName: t('admin.payment'),
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={getPaymentStatusLabel(params.value)}
          color={getPaymentStatusColor(params.value)}
          size="small"
          sx={{ fontWeight: '600', minWidth: '100px', justifyContent: 'center' }}
        />
      ),
    },
    {
      field: 'status',
      headerName: t('admin.status'),
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Select
          value={params.row.status}
          onChange={(e) => onStatusChange(params.row.id, e.target.value as any)}
          size="small"
        >
          <MenuItem value="PENDING" sx={{ color: '#333' }}>
            {t('orders.pending')}
          </MenuItem>
          <MenuItem value="PROCESSING" sx={{ color: '#333' }}>
            {t('orders.processing')}
          </MenuItem>
          <MenuItem value="SHIPPED" sx={{ color: '#333' }}>
            {t('orders.shipped')}
          </MenuItem>
          <MenuItem value="DELIVERED" sx={{ color: '#333' }}>
            {t('orders.delivered')}
          </MenuItem>
          <MenuItem value="CANCELLED" sx={{ color: '#333' }}>
            {t('orders.cancelled')}
          </MenuItem>
        </Select>
      ),
    },
  ]

  return (
    <AdminDataGrid
      rows={orders}
      columns={columns}
      isLoading={isLoading}
      total={total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  )
}
