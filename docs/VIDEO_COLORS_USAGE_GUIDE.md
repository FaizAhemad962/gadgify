# Quick Start Guide: Video & Color Features

## For Administrators

### Adding a Product with Video and Colors

1. **Login as Admin**
   - Navigate to `/admin` or click Admin Panel
   - Use your admin credentials

2. **Open Add Product Dialog**
   - Click the "Add Product" button
   - Form dialog will appear

3. **Fill Basic Product Details**
   - Product Name: e.g., "Samsung Galaxy S24"
   - Description: Detailed product information
   - Price: e.g., 79999
   - Stock: Available quantity
   - Category: Select from dropdown

4. **Upload Product Image** (Required)
   - **Option 1**: Paste image URL in first tab
   - **Option 2**: Click second tab and upload image file (max 5MB)
   - Preview will appear after upload

5. **Add Product Video** (Optional - NEW!)
   - **Method 1**: Enter video URL directly
     - Example: `http://localhost:5000/uploads/product-demo.mp4`
   - **Method 2**: Click "Upload Video File" button
     - Select video file (MP4, AVI, MOV, WMV, FLV, WEBM, MKV)
     - Maximum size: 50MB
     - Video preview will appear after selection
   - **Note**: Leave empty if no video

6. **Add Available Colors** (Optional - NEW!)
   - Enter colors separated by commas
   - Example: `Black, White, Blue, Midnight Green`
   - Example: `Red, Blue, Yellow`
   - **Note**: Leave empty if no color variants

7. **Save Product**
   - Click "Submit" or "Save" button
   - Product will be created with video and colors

### Editing Existing Products

1. Click the **Edit (pencil)** icon on any product row
2. Form will pre-fill with existing data
3. Add or change video URL/file
4. Add or modify colors
5. Click "Update" to save changes

## For Customers

### Viewing Product Videos

1. **Browse Products**
   - Go to `/products` page
   - You'll see product cards with images only
   - **Note**: Videos are NOT shown on this page

2. **View Product Details**
   - Click on product **title** or **image**
   - You'll navigate to product detail page
   - Example URL: `/products/abc-123-xyz`

3. **Watch Product Video** (if available)
   - Scroll down below product details
   - You'll see "Product Video" section
   - Video player with controls will appear
   - **Controls available**:
     - Play/Pause
     - Volume control
     - Fullscreen
     - Timeline scrubbing

4. **Select Color Variant** (if available)
   - Look for "Available Colors" section
   - Click on any color chip to select
   - Selected color will be highlighted
   - Currently visual only (doesn't affect cart)

### Example Product Detail Page Layout

```
[Back to Products Button]

┌─────────────────────────────────────────────────┐
│                                                 │
│  [Product Image]        Product Name           │
│                         ₹79,999                 │
│                                                 │
│                         Stock: 50               │
│                                                 │
│                         Description...          │
│                                                 │
│                         [Add to Cart] [Buy Now] │
│                                                 │
│                         Product Details         │
│                         Category: Electronics   │
│                         Available Stock: 50     │
│                                                 │
│                         Available Colors        │
│                         [Black] [White] [Blue]  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Product Video                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │                                             │ │
│ │         [Video Player]                      │ │
│ │         with controls                       │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Important Notes

### Video Guidelines
- **Max file size**: 50MB
- **Supported formats**: MP4, AVI, MOV, WMV, FLV, WEBM, MKV
- **Recommended**: MP4 for best browser compatibility
- **Storage**: Videos stored in `backend/uploads/` folder
- **Streaming**: No streaming service, direct file serving

### Color Guidelines
- **Format**: Comma-separated text
- **Examples**: 
  - `Red, Blue, Green`
  - `Black, White, Silver, Gold`
  - `Midnight Blue, Rose Gold, Space Gray`
- **No validation**: Any text accepted
- **Case sensitive**: "Red" and "red" are different
- **Spaces**: Automatically trimmed

### Performance Tips
- Keep videos under 20MB for better user experience
- Use compressed video formats (MP4 with H.264)
- Limit colors to 5-6 variants for clean UI
- Test video playback on mobile devices

## Troubleshooting

### Video Not Uploading
- **Check file size**: Must be ≤ 50MB
- **Check format**: Use supported video formats
- **Check connection**: Ensure stable internet
- **Try URL instead**: Use direct video URL if upload fails

### Video Not Playing
- **Browser compatibility**: Use Chrome, Firefox, or Edge
- **Video format**: MP4 works best across browsers
- **Check URL**: Ensure video URL is accessible
- **Console errors**: Check browser console for errors

### Colors Not Showing
- **Check field**: Ensure colors field is not empty
- **Comma separation**: Use commas between colors
- **Save product**: Click save after adding colors
- **Refresh page**: Hard refresh if colors don't appear

### Video Shows on Products Page
- **Expected behavior**: Videos should ONLY show on detail page
- **If showing on listing**: Clear browser cache and refresh
- **Contact admin**: Report bug if issue persists

## API Endpoints Used

### Video Upload (Admin)
```
POST /api/products/upload-image
Content-Type: multipart/form-data
Body: { file: [video file] }

Response:
{
  "imageUrl": "/uploads/product-1234567890.mp4"
}
```

### Create Product with Video & Colors (Admin)
```
POST /api/products
Headers: { Authorization: Bearer <admin-token> }
Body:
{
  "name": "Product Name",
  "description": "Description",
  "price": 1000,
  "stock": 50,
  "imageUrl": "http://...",
  "videoUrl": "http://localhost:5000/uploads/video.mp4",
  "colors": "Red, Blue, Green",
  "category": "electronics"
}
```

### Get Product Details (Public)
```
GET /api/products/:id

Response:
{
  "id": "abc-123",
  "name": "Product Name",
  ...
  "videoUrl": "http://localhost:5000/uploads/video.mp4",
  "colors": "Red, Blue, Green"
}
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify file formats and sizes
3. Test with sample video: https://www.w3schools.com/html/mov_bbb.mp4
4. Review [VIDEO_AND_COLORS_FEATURE.md](VIDEO_AND_COLORS_FEATURE.md) for technical details
