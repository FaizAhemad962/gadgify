/**
 * GST Calculator - Implementation Examples
 * 
 * Real-world examples of how to use the gstCalculator utility
 * across different pages and components
 */

// ============================================
// 1. ADMIN PRODUCT FORM - Show Calculated Values
// ============================================

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { calculateGST, formatPrice } from '@/utils/gstCalculator'
import { Box, TextField, Typography } from '@mui/material'

export function AdminProductForm() {
  const [price, setPrice] = useState(1000)
  const [gstPercentage, setGstPercentage] = useState(6)
  
  // Calculate on every price/GST change
  const calculation = calculateGST(price, gstPercentage)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Input fields */}
      <TextField
        label="Base Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />
      
      <TextField
        label="GST %"
        type="number"
        value={gstPercentage}
        onChange={(e) => setGstPercentage(Number(e.target.value))}
      />

      {/* Read-only calculated display */}
      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle2">Tax Breakdown</Typography>
        <Typography>Base Price: {formatPrice(calculation.basePrice)}</Typography>
        <Typography color="success">GST ({calculation.gstPercentage}%): {formatPrice(calculation.gstAmount)}</Typography>
        <Typography variant="h6" color="error">Final Price: {formatPrice(calculation.finalPrice)}</Typography>
      </Box>
    </Box>
  )
}

// ============================================
// 2. PRODUCTS PAGE - Display Product Price with GST
// ============================================

import { Product } from '@/types'
import { Card, Typography, Button } from '@mui/material'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const gst = calculateGST(product.price, product.gstPercentage)

  return (
    <Card sx={{ p: 2 }}>
      <img src={product.imageUrl} alt={product.name} style={{ width: '100%' }} />
      
      <Typography variant="h6">{product.name}</Typography>
      
      {/* Price breakdown */}
      <Box sx={{ my: 1 }}>
        <Typography variant="caption" color="textSecondary">
          Base Price: {formatPrice(product.price)}
        </Typography>
        
        {product.gstPercentage ? (
          <>
            <Typography variant="caption" color="success">
              + GST ({product.gstPercentage}%): {formatPrice(gst.gstAmount)}
            </Typography>
            <Typography variant="h6" color="primary">
              Total: {formatPrice(gst.finalPrice)}
            </Typography>
          </>
        ) : (
          <Typography variant="h6">{formatPrice(product.price)}</Typography>
        )}
      </Box>

      <Button variant="contained" fullWidth>
        Add to Cart - {formatPrice(gst.finalPrice)}
      </Button>
    </Card>
  )
}

// ============================================
// 3. CART PAGE - Calculate Cart Total with GST
// ============================================

import { CartItem } from '@/types'
import { Table, TableBody, TableCell, TableRow } from '@mui/material'

interface CartSummaryProps {
  items: CartItem[]
}

export function CartSummary({ items }: CartSummaryProps) {
  // Calculate total with GST for each item
  let subtotal = 0
  let totalGST = 0

  const itemsWithCalculations = items.map((item) => {
    const itemTotal = item.product.price * item.quantity
    const gst = calculateGST(itemTotal, item.product.gstPercentage)
    subtotal += itemTotal
    totalGST += gst.gstAmount
    return { ...item, gst }
  })

  const finalTotal = subtotal + totalGST

  return (
    <Box>
      {/* Item breakdown */}
      <Table>
        <TableBody>
          {itemsWithCalculations.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product.name}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">{formatPrice(item.product.price)}</TableCell>
              <TableCell align="right">{formatPrice(item.gst.basePrice)}</TableCell>
              <TableCell align="right">
                <Typography color="success">{formatPrice(item.gst.gstAmount)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">{formatPrice(item.gst.finalPrice)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Summary */}
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Typography>Subtotal: {formatPrice(subtotal)}</Typography>
        <Typography color="success">Tax (GST): + {formatPrice(totalGST)}</Typography>
        <Typography variant="h5" color="error" sx={{ mt: 1 }}>
          Total: {formatPrice(finalTotal)}
        </Typography>
      </Box>
    </Box>
  )
}

// ============================================
// 4. CHECKOUT PAGE - Invoice Preview
// ============================================

import { Order } from '@/types'
import { generateInvoiceBreakdown } from '@/utils/gstCalculator'

interface OrderInvoiceProps {
  order: Order
}

export function OrderInvoice({ order }: OrderInvoiceProps) {
  // Generate breakdown for each item
  const itemBreakdowns = order.items.map((item) =>
    generateInvoiceBreakdown(
      item.price,
      item.product?.gstPercentage,
      item.quantity
    )
  )

  return (
    <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Order Invoice
      </Typography>

      {/* Items */}
      {order.items.map((item, idx) => (
        <Box key={item.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="subtitle1">{item.product?.name}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 2 }}>
            <Typography variant="caption">
              Qty: {itemBreakdowns[idx].quantity} × {formatPrice(item.price)}
            </Typography>
            <Typography variant="caption">
              {formatPrice(itemBreakdowns[idx].subtotal)}
            </Typography>
          </Box>
          {itemBreakdowns[idx].gstAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 2 }}>
              <Typography variant="caption" color="success">
                GST ({itemBreakdowns[idx].gstPercentage}%)
              </Typography>
              <Typography variant="caption" color="success">
                {formatPrice(itemBreakdowns[idx].gstAmount)}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Subtotal
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {formatPrice(itemBreakdowns[idx].total)}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* Total */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #000' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">TOTAL AMOUNT:</Typography>
          <Typography variant="h6" color="error">
            {formatPrice(order.total)}
          </Typography>
        </Box>
      </Box>

      {/* Payment info */}
      <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5' }}>
        <Typography variant="caption">
          Payment Status: {order.paymentStatus}
        </Typography>
        <Typography variant="caption">
          Order Status: {order.status}
        </Typography>
      </Box>
    </Box>
  )
}

// ============================================
// 5. SEARCH RESULTS - Show GST in Search Results
// ============================================

export function SearchResults({ products }: { products: Product[] }) {
  return (
    <Box>
      {products.map((product) => {
        const gst = calculateGST(product.price, product.gstPercentage)
        return (
          <Box
            key={product.id}
            sx={{
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1,
              mb: 1,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle1">{product.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {product.description.substring(0, 100)}...
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="textSecondary">
                {formatPrice(product.price)}
              </Typography>
              {product.gstPercentage ? (
                <Typography variant="h6" color="error">
                  {formatPrice(gst.finalPrice)}
                </Typography>
              ) : (
                <Typography variant="h6">{formatPrice(product.price)}</Typography>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

// ============================================
// 6. BULK OPERATIONS - Calculate Multiple Items
// ============================================

interface BulkPricingRequest {
  products: Array<{ id: string; price: number; gstPercentage?: number }>
}

export function calculateBulkPricing(request: BulkPricingRequest) {
  return request.products.map((product) => {
    const gst = calculateGST(product.price, product.gstPercentage)
    return {
      id: product.id,
      ...gst,
    }
  })
}

// Usage:
const pricing = calculateBulkPricing({
  products: [
    { id: '1', price: 1000, gstPercentage: 18 },
    { id: '2', price: 5000, gstPercentage: 12 },
  ],
})
// Output:
// [
//   { id: '1', basePrice: 1000, gstPercentage: 18, gstAmount: 180, finalPrice: 1180 },
//   { id: '2', basePrice: 5000, gstPercentage: 12, gstAmount: 600, finalPrice: 5600 }
// ]

// ============================================
// 7. CUSTOM HOOK - useProductPrice
// ============================================

import { useMemo } from 'react'

export function useProductPrice(product: Product) {
  const calculation = useMemo(
    () => calculateGST(product.price, product.gstPercentage),
    [product.price, product.gstPercentage]
  )

  return {
    basePrice: calculation.basePrice,
    gstAmount: calculation.gstAmount,
    finalPrice: calculation.finalPrice,
    gstPercentage: calculation.gstPercentage,
    display: {
      basePrice: formatPrice(calculation.basePrice),
      gstAmount: formatPrice(calculation.gstAmount),
      finalPrice: formatPrice(calculation.finalPrice),
    },
  }
}

// Usage:
export function ProductInfo({ product }: { product: Product }) {
  const price = useProductPrice(product)
  
  return (
    <Box>
      <Typography>Price: {price.display.basePrice}</Typography>
      <Typography color="success">GST: {price.display.gstAmount}</Typography>
      <Typography variant="h6">Total: {price.display.finalPrice}</Typography>
    </Box>
  )
}

// ============================================
// 8. EXPORT / REPORTING - CSV with GST Details
// ============================================

export function generateCSVReport(products: Product[]) {
  const rows = [
    ['ID', 'Name', 'Base Price', 'GST %', 'GST Amount', 'Final Price'],
    ...products.map((p) => {
      const gst = calculateGST(p.price, p.gstPercentage)
      return [
        p.id,
        p.name,
        p.price.toString(),
        (gst.gstPercentage || 0).toString(),
        gst.gstAmount.toString(),
        gst.finalPrice.toString(),
      ]
    }),
  ]

  const csv = rows.map((row) => row.join(',')).join('\n')
  return csv
}

// ============================================
// KEY TAKEAWAYS
// ============================================

/*
✅ Always use calculateGST() for dynamic values
✅ Display separate Base Price, GST Amount, Final Price
✅ Use formatPrice() for consistent formatting
✅ Keep HSN code visible on invoices
✅ Store GST % in database (not GST amount)
✅ Recalculate whenever price or rate changes
✅ Show GST breakdown to customers
✅ Export/report with full breakdown

❌ Never hardcode GST amounts
❌ Never store calculated values
❌ Never skip GST display
❌ Never mix currencies in calculations
*/
