import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  type TableProps,
  type TableContainerProps,
} from '@mui/material'

interface CustomTableProps {
  headers: { key: string; label: string; align?: 'left' | 'right' | 'center' }[]
  rows: Array<Record<string, any>>
  isDarkTheme?: boolean
  containerProps?: Partial<TableContainerProps>
  tableProps?: Partial<TableProps>
  onRowClick?: (row: Record<string, any>, index: number) => void
}

export const CustomTable = ({
  headers,
  rows,
  isDarkTheme = true,
  containerProps,
  tableProps,
  onRowClick,
}: CustomTableProps) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: isDarkTheme ? '#242628' : '#ffffff',
        color: isDarkTheme ? '#a0a0a0' : '#000000',
        border: isDarkTheme ? '1px solid #3a3a3a' : '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        ...containerProps?.sx,
      }}
      {...containerProps}
    >
      <Table {...tableProps}>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: isDarkTheme ? '#1976d2' : '#f5f5f5',
              borderBottom: isDarkTheme ? '2px solid #3a3a3a' : '2px solid #e0e0e0',
            }}
          >
            {headers.map((header) => (
              <TableCell
                key={header.key}
                align={header.align || 'left'}
                sx={{
                  color: isDarkTheme ? '#fff' : '#000',
                  fontWeight: '700',
                }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              sx={{
                borderBottom: isDarkTheme ? '1px solid #3a3a3a' : '1px solid #e0e0e0',
                bgcolor: isDarkTheme ? '#1e1e1e' : '#ffffff',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': onRowClick ? {
                  bgcolor: isDarkTheme ? '#2d3339' : '#f5f5f5',
                  boxShadow: isDarkTheme
                    ? 'inset 0 0 0 1px rgba(25, 118, 210, 0.2)'
                    : 'inset 0 0 0 1px rgba(25, 118, 210, 0.1)',
                } : {},
              }}
            >
              {headers.map((header) => (
                <TableCell
                  key={`${rowIndex}-${header.key}`}
                  align={header.align || 'left'}
                  sx={{
                    color: isDarkTheme ? '#e0e0e0' : '#000000',
                  }}
                >
                  {row[header.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
