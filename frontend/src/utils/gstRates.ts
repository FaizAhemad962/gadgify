/**
 * GST Rates and HSN Code Mapping for Different Product Categories (Frontend)
 * Based on Indian GST regulations (as of 2026)
 */

export interface CategoryGSTInfo {
  hsn: string
  gstRate: number
  description: string
}

export const CATEGORY_GST_MAPPING: Record<string, CategoryGSTInfo> = {
  'Electronics': { hsn: '8517', gstRate: 18, description: 'Mobile phones, tablets, and electronic devices' },
  'Mobiles': { hsn: '8517', gstRate: 18, description: 'Mobile phones and smartphones' },
  'Laptops': { hsn: '8471', gstRate: 18, description: 'Laptops and portable computers' },
  'Computers': { hsn: '8471', gstRate: 18, description: 'Desktop computers and accessories' },
  'Tablets': { hsn: '8471', gstRate: 18, description: 'Tablet computers' },
  'Audio': { hsn: '8518', gstRate: 18, description: 'Headphones, speakers, and audio equipment' },
  'Cameras': { hsn: '8525', gstRate: 18, description: 'Digital cameras and video equipment' },
  'Smartwatches': { hsn: '8517', gstRate: 18, description: 'Smartwatches and wearable devices' },
  'Home Appliances': { hsn: '8516', gstRate: 18, description: 'Home appliances and kitchen equipment' },
  'Kitchen Appliances': { hsn: '8516', gstRate: 18, description: 'Kitchen appliances' },
  'Fashion': { hsn: '6203', gstRate: 12, description: 'Readymade garments and clothing' },
  'Clothing': { hsn: '6203', gstRate: 12, description: 'Clothing and apparel' },
  'Footwear': { hsn: '6403', gstRate: 12, description: 'Footwear' },
  'Books': { hsn: '4901', gstRate: 0, description: 'Printed books and educational materials' },
  'Toys': { hsn: '9503', gstRate: 12, description: 'Toys and games' },
  'Sports': { hsn: '9506', gstRate: 18, description: 'Sports equipment and accessories' },
  'Furniture': { hsn: '9403', gstRate: 18, description: 'Furniture and home furnishings' },
  'Beauty': { hsn: '3304', gstRate: 18, description: 'Beauty and personal care products' },
  'Personal Care': { hsn: '3304', gstRate: 18, description: 'Personal care products' },
  'Grocery': { hsn: '2106', gstRate: 5, description: 'Packaged food products' },
  'Automotive': { hsn: '8703', gstRate: 28, description: 'Automotive parts and accessories' },
  'Jewelry': { hsn: '7113', gstRate: 3, description: 'Jewelry and precious stones' },
  'Stationery': { hsn: '4820', gstRate: 12, description: 'Stationery and office supplies' }
}

export const getGSTInfoForCategory = (category: string): CategoryGSTInfo => {
  return CATEGORY_GST_MAPPING[category] || { hsn: '8517', gstRate: 18, description: 'General merchandise' }
}

export const calculateProductGST = (price: number, category: string): number => {
  const gstInfo = getGSTInfoForCategory(category)
  return (price * gstInfo.gstRate) / 100
}

export const calculateOrderGST = (
  items: Array<{ price: number; quantity: number; category: string }>
): number => {
  return items.reduce((totalGST, item) => {
    const itemTotal = item.price * item.quantity
    const gstRate = getGSTInfoForCategory(item.category).gstRate
    const itemGST = (itemTotal * gstRate) / 100
    return totalGST + itemGST
  }, 0)
}

export const getGSTBreakdown = (
  items: Array<{ price: number; quantity: number; category: string }>
): Record<number, { amount: number; hsn: string; description: string }> => {
  const breakdown: Record<number, { amount: number; hsn: string; description: string }> = {}
  
  items.forEach(item => {
    const gstInfo = getGSTInfoForCategory(item.category)
    const itemTotal = item.price * item.quantity
    const itemGST = (itemTotal * gstInfo.gstRate) / 100
    
    if (!breakdown[gstInfo.gstRate]) {
      breakdown[gstInfo.gstRate] = {
        amount: 0,
        hsn: gstInfo.hsn,
        description: gstInfo.description
      }
    }
    
    breakdown[gstInfo.gstRate].amount += itemGST
  })
  
  return breakdown
}
