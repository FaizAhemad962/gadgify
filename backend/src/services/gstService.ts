/**
 * GST Service - Fetches official GST rates from government sources
 * Falls back to hardcoded rates if API is unavailable
 * SECURITY: All inputs are validated before use
 */

import axios from 'axios'
import { validateHSNCode } from '../middlewares/securityValidator'

interface HSNGSTData {
  hsn: string
  gstRate: number
  description: string
  lastUpdated: Date
}

// Fallback hardcoded rates (updated as of 2026)
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

// Cache for HSN data
const hsnCache = new Map<string, { data: HSNGSTData; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetch GST rate for a given HSN code from government sources
 * @param hsn - HSN code (4-8 digits, validated)
 * @returns GST rate and details
 * @throws Error if HSN format is invalid
 */
export const fetchGSTRateByHSN = async (hsn: string): Promise<HSNGSTData> => {
  // SECURITY: Validate HSN code format
  const cleanHSN = hsn.trim()
  if (!validateHSNCode(cleanHSN)) {
    throw new Error(`Invalid HSN code format: ${cleanHSN}`)
  }

  // Check cache first
  const cached = hsnCache.get(cleanHSN)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    // Try official GST Council API (if available)
    const gstData = await fetchFromGSTAPI(cleanHSN)
    const result = {
      hsn: cleanHSN,
      gstRate: gstData.rate,
      description: gstData.description,
      lastUpdated: new Date(),
    }

    // Cache the result
    hsnCache.set(cleanHSN, { data: result, timestamp: Date.now() })
    return result
  } catch (error) {
    console.warn(`Failed to fetch GST rate for HSN ${cleanHSN} from API, using fallback`, error)
    return getFallbackGSTRate(cleanHSN)
  }
}

/**
 * Fetch GST rate from official government sources
 * Currently supports:
 * 1. GST Council Official Database (if API available)
 * 2. Shunyatech GST API (free tier)
 * 3. Local fallback mapping
 * SECURITY: Only accepts validated HSN codes
 */
async function fetchFromGSTAPI(hsn: string): Promise<{ rate: number; description: string }> {
  // SECURITY: Use validated HSN in URL
  const encodedHSN = encodeURIComponent(hsn)

  // Try Shunyatech GST API (free, public service)
  try {
    const response = await axios.get(
      `https://api.shunyatech.com/gst/search?hsn_code=${encodedHSN}`,
      {
        timeout: 5000,
        headers: {
          'User-Agent': 'Gadgify-ecommerce/1.0',
          'Accept': 'application/json',
        },
      }
    )

    if (response.data && response.data.data) {
      const gstRate = response.data.data.gst_rate || response.data.data.tax_rate
      return {
        rate: typeof gstRate === 'string' ? parseFloat(gstRate) : gstRate,
        description: response.data.data.description || 'GST applicable product',
      }
    }
  } catch (error) {
    console.warn('Shunyatech API failed, trying alternative sources')
  }

  // Try GST India Official API (if available)
  try {
    const response = await axios.get(
      `https://gstapi.amagin.com/hsn/${encodedHSN}`,
      {
        timeout: 5000,
        headers: {
          'User-Agent': 'Gadgify-ecommerce/1.0',
          'Accept': 'application/json',
        },
      }
    )

    if (response.data) {
      return {
        rate: response.data.gstRate || response.data.tax_rate,
        description: response.data.description || 'GST applicable product',
      }
    }
  } catch (error) {
    console.warn('GST India API failed')
  }

  // If both APIs fail, throw error to use fallback
  throw new Error('All GST APIs unavailable')
}

/**
 * Get fallback GST rate from hardcoded mapping
 */
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

  // Default to 18% if HSN not found
  return {
    hsn,
    gstRate: 18,
    description: 'General merchandise',
    lastUpdated: new Date(),
  }
}

/**
 * Get GST rate by category (uses HSN mapping)
 */
export const getGSTRateByCategory = async (hsn: string | undefined): Promise<number> => {
  if (!hsn) {
    return 18 // Default GST rate
  }

  const gstData = await fetchGSTRateByHSN(hsn)
  return gstData.gstRate
}

/**
 * Bulk fetch GST rates for multiple HSN codes
 */
export const fetchGSTRatesForProducts = async (
  hsnCodes: string[]
): Promise<Record<string, number>> => {
  const rates: Record<string, number> = {}

  // Fetch in parallel, max 5 concurrent requests
  const chunks = []
  for (let i = 0; i < hsnCodes.length; i += 5) {
    chunks.push(hsnCodes.slice(i, i + 5))
  }

  for (const chunk of chunks) {
    const results = await Promise.all(
      chunk.map((hsn) => fetchGSTRateByHSN(hsn).then((data) => ({ hsn, rate: data.gstRate })))
    )

    results.forEach(({ hsn, rate }) => {
      rates[hsn] = rate
    })
  }

  return rates
}

/**
 * Clear cache (useful for testing or forcing refresh)
 */
export const clearGSTCache = (): void => {
  hsnCache.clear()
  console.log('GST rate cache cleared')
}

/**
 * Get cache statistics
 */
export const getGSTCacheStats = () => {
  return {
    size: hsnCache.size,
    entries: Array.from(hsnCache.entries()).map(([hsn, { timestamp }]) => ({
      hsn,
      cachedAt: new Date(timestamp),
    })),
  }
}
