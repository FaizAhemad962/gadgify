/**
 * GST Calculator Utility
 * 
 * All GST calculations must be done dynamically, NOT stored in the database.
 * This ensures tax compliance and correct invoice generation.
 * 
 * Legal Requirements:
 * - GST is calculated as: (Base Price × GST %) / 100
 * - Final Price = Base Price + GST Amount
 * - Invoices must show Base Price, GST Amount, and Final Price separately
 * - HSN code must match the GST percentage
 */

export interface GSTCalculation {
  basePrice: number
  gstPercentage: number
  gstAmount: number
  finalPrice: number
}

/**
 * Calculate GST amount and final price
 * @param basePrice - The base price without GST
 * @param gstPercentage - GST percentage (0-100)
 * @returns Object containing all price breakdowns
 */
export const calculateGST = (basePrice: number, gstPercentage?: number): GSTCalculation => {
  const gstRate = gstPercentage ?? 0
  const gstAmount = (basePrice * gstRate) / 100
  
  return {
    basePrice,
    gstPercentage: gstRate,
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    finalPrice: parseFloat((basePrice + gstAmount).toFixed(2)),
  }
}

/**
 * Format price for display
 * @param price - The price to format
 * @returns Formatted price string (e.g., "₹1,234.56")
 */
export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format price without currency symbol
 * @param price - The price to format
 * @returns Formatted price string (e.g., "1,234.56")
 */
export const formatPriceNumber = (price: number): string => {
  return price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Generate invoice breakdown
 * Useful for order confirmation, invoices, etc.
 */
export const generateInvoiceBreakdown = (
  basePrice: number,
  gstPercentage?: number,
  quantity: number = 1
) => {
  const totalBasePrice = basePrice * quantity
  const gst = calculateGST(totalBasePrice, gstPercentage)
  
  return {
    itemPrice: basePrice,
    quantity,
    subtotal: totalBasePrice,
    gstPercentage: gst.gstPercentage,
    gstAmount: gst.gstAmount,
    total: gst.finalPrice,
  }
}

/**
 * Extract price breakdown from cart item
 * (For displaying cart totals with GST)
 */
export const calculateCartItemTotal = (
  basePrice: number,
  quantity: number,
  gstPercentage?: number
) => {
  const subtotal = basePrice * quantity
  const gst = calculateGST(subtotal, gstPercentage)
  
  return {
    basePrice,
    quantity,
    subtotal,
    gstAmount: gst.gstAmount,
    total: gst.finalPrice,
  }
}

/**
 * Standard GST rates in India (for reference)
 * This is optional - you can allow custom rates
 */
export const STANDARD_GST_RATES = {
  '0%': 0,
  '5%': 5,
  '12%': 12,
  '18%': 18,
  '28%': 28,
} as const

/**
 * Common HSN codes and their standard GST rates
 * Update this as needed for your product categories
 */
export const HSN_GST_MAPPING: Record<string, number> = {
  // Electronics
  '8517': 18, // Telephone sets
  '8517.62': 18, // Mobile phones
  '8471': 12, // Computers
  '8528': 18, // Monitors
  '8504': 18, // Power adapters
  
  // Accessories
  '8544': 18, // Cables
  '8536': 18, // Switches
  
  // Home Appliances
  '8509': 18, // Vacuum cleaners
  '8516': 18, // Electric water heaters
  
  // Add more as needed
}

/**
 * Get GST percentage from HSN code
 * @param hsnCode - The HSN code to look up
 * @returns GST percentage or 0 if not found
 */
export const getGSTFromHSN = (hsnCode?: string): number => {
  if (!hsnCode) return 0
  return HSN_GST_MAPPING[hsnCode] ?? 0
}
