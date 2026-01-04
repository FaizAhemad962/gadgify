/**
 * GST Service for Frontend - Fetches GST rates dynamically
 */

import axios from 'axios'

interface HSNGSTData {
  hsn: string
  gstRate: number
  description: string
  lastUpdated: Date
}

// Fallback hardcoded rates
const FALLBACK_HSN_GST_MAPPING: Record<string, { rate: number; description: string }> = {
  '8517': { rate: 18, description: 'Mobile phones, smartphones, tablets' },
  '8471': { rate: 18, description: 'Laptops and portable computers' },
  '8518': { rate: 18, description: 'Headphones and audio equipment' },
  '8525': { rate: 18, description: 'Digital cameras and video equipment' },
  '8516': { rate: 18, description: 'Home appliances' },
  '6203': { rate: 12, description: 'Readymade garments' },
  '6403': { rate: 12, description: 'Footwear' },
  '4901': { rate: 0, description: 'Printed books' },
  '9503': { rate: 12, description: 'Toys and games' },
  '9506': { rate: 18, description: 'Sports equipment' },
  '9403': { rate: 18, description: 'Furniture' },
  '3304': { rate: 18, description: 'Beauty and personal care' },
  '2106': { rate: 5, description: 'Packaged food products' },
  '8703': { rate: 28, description: 'Automotive parts' },
  '7113': { rate: 3, description: 'Jewelry' },
  '4820': { rate: 12, description: 'Stationery' },
}

const hsnCache = new Map<string, { data: HSNGSTData; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000

export const fetchGSTRateByHSN = async (hsn: string): Promise<HSNGSTData> => {
  const cached = hsnCache.get(hsn)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    // Try calling backend endpoint instead of external API
    const response = await axios.get(`/api/gst/rate/${hsn}`, { timeout: 5000 })
    
    const result = {
      hsn,
      gstRate: response.data.gstRate,
      description: response.data.description,
      lastUpdated: new Date(),
    }
    
    hsnCache.set(hsn, { data: result, timestamp: Date.now() })
    return result
  } catch (error) {
    console.warn(`Failed to fetch GST rate for HSN ${hsn}, using fallback`, error)
    return getFallbackGSTRate(hsn)
  }
}

function getFallbackGSTRate(hsn: string): HSNGSTData {
  const mapping = FALLBACK_HSN_GST_MAPPING[hsn]

  if (mapping) {
    return {
      hsn,
      gstRate: mapping.rate,
      description: mapping.description,
      lastUpdated: new Date(),
    }
  }

  return {
    hsn,
    gstRate: 18,
    description: 'General merchandise',
    lastUpdated: new Date(),
  }
}

export const getGSTRateByCategory = async (hsn: string | undefined): Promise<number> => {
  if (!hsn) {
    return 18
  }

  const gstData = await fetchGSTRateByHSN(hsn)
  return gstData.gstRate
}

export const clearGSTCache = (): void => {
  hsnCache.clear()
}
