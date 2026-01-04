# GST Rate Management System - Dynamic Government API Integration

## Overview
The system now fetches official GST rates from government sources using HSN (Harmonized System of Nomenclature) codes, with intelligent fallback to cached/hardcoded rates.

## Architecture

### 1. **Backend GST Service** (`src/services/gstService.ts`)
- **Primary Sources (in order of preference):**
  - Shunyatech GST API (free, public service) - https://api.shunyatech.com/gst/search
  - GST India Official API (if available) - https://gstapi.amagin.com/hsn
  - Local fallback mapping (hardcoded rates)

- **Features:**
  - ✅ Fetches real-time GST rates by HSN code
  - ✅ 24-hour intelligent caching
  - ✅ Parallel batch fetching (max 5 concurrent requests)
  - ✅ Automatic fallback to hardcoded rates
  - ✅ Error handling and timeout management (5 second timeout per request)

### 2. **API Endpoint**
```
GET /api/products/gst/rate/:hsn
```
**Response:**
```json
{
  "hsn": "8517",
  "gstRate": 18,
  "description": "Mobile phones, smartphones, tablets",
  "lastUpdated": "2026-01-04T10:30:00.000Z",
  "source": "government-api-with-fallback"
}
```

### 3. **Frontend GST Service** (`src/services/gstService.ts`)
- Calls backend `/api/gst/rate/:hsn` endpoint
- Client-side caching (24 hours)
- Automatic fallback for API failures

### 4. **Order Creation Flow**
```
User creates order
    ↓
Backend fetches all product HSN codes
    ↓
Batch fetch GST rates from government API (with cache)
    ↓
Calculate itemized GST breakdown
    ↓
Store order with accurate GST data
    ↓
Display to user
```

## GST Rate Fallback Mapping

**Current HSN Codes Supported:**

| HSN | Rate | Category |
|-----|------|----------|
| 8517 | 18% | Mobiles, Tablets, Smartwatches |
| 8471 | 18% | Laptops, Computers |
| 8518 | 18% | Audio Equipment |
| 8525 | 18% | Cameras |
| 8516 | 18% | Home Appliances |
| 6203 | 12% | Readymade Garments |
| 6403 | 12% | Footwear |
| 4901 | 0% | Printed Books |
| 9503 | 12% | Toys |
| 9506 | 18% | Sports Equipment |
| 9403 | 18% | Furniture |
| 3304 | 18% | Beauty & Personal Care |
| 2106 | 5% | Packaged Food |
| 8703 | 28% | Automotive |
| 7113 | 3% | Jewelry |
| 4820 | 12% | Stationery |

## Key Features

### 1. **Dynamic Rate Updates**
- Rates automatically update from government sources
- No need to manually update rates in code
- 24-hour cache prevents excessive API calls

### 2. **Government API Integration**
- Primary source: Shunyatech GST API (free tier)
- Alternative: GST India Official API
- Automatic failover to hardcoded rates

### 3. **Batch Processing**
- Fetches rates for multiple HSN codes in parallel (max 5 concurrent)
- Efficient rate limiting to avoid API throttling
- Reduced order creation latency

### 4. **Intelligent Caching**
```javascript
// Cache structure:
Map {
  '8517': { 
    data: { hsn, gstRate, description, lastUpdated },
    timestamp: Date
  }
}

// Auto-expires after 24 hours
```

### 5. **Error Handling**
- **API Timeout:** 5 seconds per request
- **API Failure:** Automatically falls back to cached/hardcoded rates
- **Invalid HSN:** Returns default 18% GST
- **Batch Size:** Max 5 concurrent requests to prevent overload

## Usage Examples

### Backend Usage
```typescript
// Single HSN code
const gstData = await fetchGSTRateByHSN('8517')
console.log(gstData.gstRate) // 18

// Bulk fetch
const rates = await fetchGSTRatesForProducts(['8517', '6203', '8471'])
// { '8517': 18, '6203': 12, '8471': 18 }

// Get cache stats
const stats = getGSTCacheStats()
// { size: 3, entries: [...] }

// Clear cache (testing/refresh)
clearGSTCache()
```

### Frontend Usage
```typescript
// Fetch rate for a product
const gstData = await fetchGSTRateByHSN('8517')

// Get rate by category
const rate = await getGSTRateByCategory(hsn)
```

## Data Flow Diagram

```
User Creates Order
        ↓
Backend: validateStock()
        ↓
Collect HSN codes from products
        ↓
fetchGSTRatesForProducts(hsnCodes)
        ↓
    ├─→ Check cache (24h) ✓
    │       ↓
    │   Return cached rate
    │
    └─→ Cache miss
        ├─→ Try Shunyatech API
        │   ├─ Success? Return + Cache
        │   └─ Fail? Try alternative
        │
        └─→ Try GST India API
            ├─ Success? Return + Cache
            └─ Fail? Use fallback + Cache
        ↓
Calculate itemized GST
        ↓
Create Order with GST breakdown
        ↓
Return to user
```

## Benefits

✅ **Accuracy:** Uses official government rates
✅ **Compliance:** Always up-to-date with GST Council changes
✅ **Performance:** Intelligent caching reduces API calls
✅ **Reliability:** Multiple fallback options
✅ **Transparency:** Users see exact GST rates per category
✅ **Scalability:** Batch processing for efficient rate fetching

## Updating Hardcoded Rates

When government updates GST rates, update the fallback mapping:

```typescript
// src/services/gstService.ts
const FALLBACK_HSN_GST_MAPPING: Record<string, { rate: number; description: string }> = {
  '8517': { rate: 18, description: '...' }, // Update rate here
  // ... other codes
}
```

The cache will automatically use new rates on next refresh.

## Future Enhancements

1. **Admin Dashboard:** View and update HSN to GST mappings
2. **Rate Change Alerts:** Notify when government updates rates
3. **Historical Tracking:** Log GST rate changes over time
4. **Invoice Generation:** Include GST breakdown in invoices
5. **Compliance Reports:** Generate GST filing reports by rate

## API Endpoints Called

1. **Shunyatech API:**
   ```
   GET https://api.shunyatech.com/gst/search?hsn_code=8517
   ```

2. **GST India API:**
   ```
   GET https://gstapi.amagin.com/hsn/8517
   ```

3. **Backend GST Endpoint:**
   ```
   GET /api/products/gst/rate/8517
   ```

## Notes

- HSN codes should be stored in Product model (already done)
- If HSN is missing, defaults to 18% GST
- Cache is in-memory (resets on server restart)
- For production, consider using Redis for persistent cache
