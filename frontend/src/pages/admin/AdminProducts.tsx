import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Add, Upload, Search } from '@mui/icons-material'
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { productsApi } from '../../api/products'
import { AdminProductsDataGrid } from '../../components/admin/AdminProductsDataGrid'
import type { Product } from '../../types'

const CATEGORIES = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Smartwatches',
  'Headphones',
  'Cameras',
  'Gaming',
  'Accessories',
  'Home Appliances',
  'Audio',
  'Wearables',
]

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  colors: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  hsnNo: z.string().optional(),
  gstPercentage: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined
      const num = Number(val)
      return Number.isNaN(num) ? undefined : num
    })
    .refine((val) => val === undefined || (val >= 0 && val <= 100), {
      message: 'GST must be between 0 and 100',
    }),
})

type ProductFormData = {
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl?: string
  videoUrl?: string
  colors?: string
  hsnNo?: string
  gstPercentage?: number
}

const AdminProducts = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSelectedCategory] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', page, rowsPerPage, searchQuery],
    queryFn: () => productsApi.getAllProducts(page + 1, rowsPerPage, searchQuery),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
  })

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleClose()
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : t('admin.payloadError')
      setError(errorMessage)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleClose()
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : t('admin.payloadError')
      setError(errorMessage)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleOpen = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setSelectedCategory(product.category)
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        videoUrl: product.videoUrl || '',
        colors: product.colors || '',
        category: product.category,
        hsnNo: product.hsnNo || '',
        gstPercentage: product.gstPercentage ?? undefined,
      })
      
      // Set image preview
      setImagePreview(product.imageUrl)
      
      // Set video preview - ensure full URL
      if (product.videoUrl) {
        // If it's already a full URL, use it; otherwise construct it
        const videoUrl = product.videoUrl.startsWith('http') 
          ? product.videoUrl 
          : `http://localhost:5000${product.videoUrl}`
        setVideoPreview(videoUrl)
        console.log('Video preview URL:', videoUrl)
      }
    } else {
      setEditingProduct(null)
      setSelectedCategory('')
      reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        imageUrl: '',
        videoUrl: '',
        colors: '',
        category: CATEGORIES[0],
        hsnNo: '',
        gstPercentage: undefined,
      })
      setImagePreview('')
      setVideoPreview('')
    }
    setOpen(true)
    setError('')
    setImageFile(null)
    setVideoFile(null)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingProduct(null)
    reset()
    setError('')
    setImageFile(null)
    setVideoFile(null)
    setImagePreview('')
    setVideoPreview('')
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    // Clear the imageUrl in the form
    reset((formValues) => ({ ...formValues, imageUrl: '' }))
    // If editing, clear the imageUrl from editingProduct
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, imageUrl: '' })
    }
  }

  const handleRemoveVideo = () => {
    setVideoFile(null)
    setVideoPreview('')
    // Clear the videoUrl in the form
    reset((formValues) => ({ ...formValues, videoUrl: '' }))
    // If editing, clear the videoUrl from editingProduct
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, videoUrl: '' })
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size: 500KB limit
      if (file.size > 500 * 1024) {
        setError(t('admin.imageSizeError') || 'Image size should not exceed 500KB')
        return
      }
      setImageFile(file)
      // Show preview only - no need to convert to base64 for storage
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size: 50MB limit
      if (file.size > 50 * 1024 * 1024) {
        setError('Video size should not exceed 50MB')
        return
      }
      setVideoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    let finalImageUrl = data.imageUrl || ''
    let finalVideoUrl = data.videoUrl || ''

    // If user uploaded a new image file, upload it first and get the URL
    if (imageFile) {
      try {
        const uploadResult = await productsApi.uploadImage(imageFile)
        // uploadResult.imageUrl is like "/uploads/product-123456.jpg"
        // We need the full URL for display
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const baseUrl = apiUrl.replace('/api', '')
        finalImageUrl = `${baseUrl}${uploadResult.imageUrl}`
        console.log('Uploaded image URL:', finalImageUrl)
      } catch (err) {
        console.error('Upload error:', err)
        setError('Failed to upload image. Please try again.')
        return
      }
    } else if (editingProduct && !finalImageUrl) {
      // When editing without uploading new image, keep existing image
      finalImageUrl = editingProduct.imageUrl
    }

    // If user uploaded a new video file
    if (videoFile) {
      try {
        const uploadResult = await productsApi.uploadVideo(videoFile)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const baseUrl = apiUrl.replace('/api', '')
        finalVideoUrl = `${baseUrl}${uploadResult.videoUrl}`
        console.log('Uploaded video URL:', finalVideoUrl)
      } catch (err) {
        console.error('Video upload error:', err)
        setError('Failed to upload video. Please try again.')
        return
      }
    } else if (editingProduct && !finalVideoUrl) {
      // When editing without uploading new video, keep existing video
      finalVideoUrl = editingProduct.videoUrl || ''
    }

    // Validate that we have an image
    if (!finalImageUrl) {
      setError(t('admin.imageRequired'))
      return
    }

    const productData = {
      ...data,
      gstPercentage: data.gstPercentage ?? undefined,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl || undefined,
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: productData })
    } else {
      createMutation.mutate(productData)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      deleteMutation.mutate(id)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage)
    setPage(0)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="600" sx={{ color: '#fff', background: 'linear-gradient(135deg, #1976d2, #ff9800)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('admin.products')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{
            bgcolor: '#1976d2',
            color: '#fff',
            textTransform: 'none',
            fontWeight: '600',
            px: 3,
            py: 1.2,
            borderRadius: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: '#1565c0',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
            }
          }}
        >
          {t('admin.addProduct')}
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder={t('admin.searchProducts')}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(0) // Reset to first page on search
          }}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 300,
            backgroundColor: '#fff',
            borderRadius: 1.5,
            '& .MuiOutlinedInput-root': {
              color: '#333',
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>

      <AdminProductsDataGrid
        products={productsData?.products || []}
        onEdit={handleOpen}
        onDelete={handleDelete}
        page={page}
        rowsPerPage={rowsPerPage}
        total={productsData?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        isLoading={isLoading}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#ffffff',
            backgroundImage: 'none',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
          }
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ color: '#1976d2', fontWeight: '600', borderBottom: '1px solid #e0e0e0', fontSize: '1.3rem' }}>
            {editingProduct ? t('admin.editProduct') : t('admin.addNewProduct')}
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#ffffff', backgroundImage: 'none' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', color: '#ef5350', border: '1px solid rgba(244, 67, 54, 0.3)' }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  label={t('admin.productName')}
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                 
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('admin.description')}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label={t('products.price')}
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                   
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label={t('products.stock')}
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    error={!!errors.stock}
                    helperText={errors.stock?.message}
                   
                  />
                </Box>
              </Box>

              <Box>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel sx={{ color: '#b0b0b0' }}>{t('admin.category')}</InputLabel>
                  <Select
                    label={t('admin.category')}
                    {...register('category')}
                    defaultValue={editingProduct?.category || CATEGORIES[0]}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#1e1e1e',
                          border: '1px solid #3a3a3a',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                        }
                      }
                    }}
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category} sx={{ bgcolor: '#1e1e1e', color: '#b0b0b0', fontSize: '0.875rem', py: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: '#1976d2', color: '#fff' }, '&.Mui-selected': { bgcolor: '#1565c0', color: '#fff', fontWeight: '600', '&:hover': { bgcolor: '#0d47a1' } } }}>
                        {t(`categories.${category}`)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.category?.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* HSN No and GST % Section with Calculated Fields */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="HSN No."
                    placeholder="e.g., 8517.62"
                    {...register('hsnNo')}
                    error={!!errors.hsnNo}
                    helperText={errors.hsnNo?.message}
                    
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="GST %"
                    type="number"
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                    {...register('gstPercentage')}
                    error={!!errors.gstPercentage}
                    helperText={errors.gstPercentage?.message || '(0-100) Optional'}
                   
                  />
                </Box>
              </Box>

              {/* Tax Calculation Display (Read-Only) */}
              {editingProduct?.price && editingProduct?.gstPercentage ? (
                <Box sx={{ p: 1.5, bgcolor: '#1e1e1e', border: '1px solid #3a3a3a', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: '600', mb: 1 }}>
                    💰 Tax Calculation
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: '#707070' }}>Base Price</Typography>
                      <Typography sx={{ color: '#b0b0b0', fontWeight: '600' }}>₹{(editingProduct?.price || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: '#707070' }}>GST Amount ({editingProduct?.gstPercentage}%)</Typography>
                      <Typography sx={{ color: '#4caf50', fontWeight: '600' }}>₹{(((editingProduct?.price || 0) * (editingProduct?.gstPercentage || 0)) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: '#707070' }}>Final Price (incl. GST)</Typography>
                      <Typography sx={{ color: '#ff9800', fontWeight: '700', fontSize: '1.1rem' }}>₹{((editingProduct?.price || 0) + (((editingProduct?.price || 0) * (editingProduct?.gstPercentage || 0)) / 100)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : null}

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#b0b0b0', fontWeight: '600' }}>
                  {t('admin.productImage')}
                </Typography>
                {/* Hidden field to maintain imageUrl in form */}
                <input type="hidden" {...register('imageUrl')} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                    sx={{
                      color: '#1976d2',
                      borderColor: '#1976d2',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)', borderColor: '#42a5f5', color: '#42a5f5' }
                    }}
                  >
                    {t('admin.chooseImage')}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageFileChange}
                      key={imageFile?.name || 'image-input'}
                    />
                  </Button>
                  {(imageFile || imagePreview) && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveImage}
                      sx={{
                        borderColor: '#ef5350',
                        color: '#ef5350',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.1)', borderColor: '#f44336', color: '#f44336' }
                      }}
                    >
                      {t('admin.remove')}
                    </Button>
                  )}
                </Box>
                {imageFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: '#b0b0b0' }}>
                    {t('admin.selected')}: {imageFile.name}
                  </Typography>
                )}
                {!imageFile && editingProduct?.imageUrl && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: '#707070' }}>
                    {t('admin.current')}: {editingProduct.imageUrl.split('/').pop()}
                  </Typography>
                )}
                
                {imagePreview && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" display="block" sx={{ mb: 1, color: '#b0b0b0' }}>
                      {t('admin.preview')}:
                    </Typography>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Preview"
                      sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1, border: '1px solid #3a3a3a' }}
                    />
                  </Box>
                )}
              </Box>

              {/* Video Upload Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#b0b0b0', fontWeight: '600' }}>
                  {t('admin.productVideo')}
                </Typography>
                {/* Hidden field to maintain videoUrl in form */}
                <input type="hidden" {...register('videoUrl')} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                    sx={{
                      color: '#1976d2',
                      borderColor: '#1976d2',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)', borderColor: '#42a5f5', color: '#42a5f5' }
                    }}
                  >
                    {t('admin.uploadVideo')}
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      key={videoFile?.name || 'video-input'}
                    />
                  </Button>
                  {(videoFile || videoPreview) && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveVideo}
                      sx={{
                        borderColor: '#ef5350',
                        color: '#ef5350',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.1)', borderColor: '#f44336', color: '#f44336' }
                      }}
                    >
                      {t('admin.remove')}
                    </Button>
                  )}
                </Box>
                {videoFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: '#b0b0b0' }}>
                    {t('admin.selected')}: {videoFile.name}
                  </Typography>
                )}
                {!videoFile && editingProduct?.videoUrl && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: '#707070' }}>
                    {t('admin.current')}: {editingProduct.videoUrl.split('/').pop()}
                  </Typography>
                )}
                {videoPreview && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" display="block" sx={{ mb: 1, color: '#b0b0b0' }}>
                      {t('admin.videoPreview')}:
                    </Typography>
                    <Box
                      component="video"
                      src={videoPreview}
                      controls
                      sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, border: '1px solid #3a3a3a' }}
                    />
                  </Box>
                )}
              </Box>

              {/* Colors Section */}
              <Box>
                <TextField
                  fullWidth
                  label={t('admin.colors')}
                  placeholder={t('admin.colorsPlaceholder')}
                  {...register('colors')}
                  error={!!errors.colors}
                  helperText={errors.colors?.message || t('admin.colorsHelper')}
                 
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#ffffff', borderTop: '1px solid #e0e0e0', p: 2, gap: 1 }}>
            <Button onClick={handleClose} sx={{ color: '#b0b0b0', textTransform: 'none', fontWeight: '500', '&:hover': { bgcolor: 'rgba(176, 176, 176, 0.1)' } }}>
              {t('admin.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
              sx={{
                bgcolor: '#1976d2',
                color: '#fff',
                textTransform: 'none',
                fontWeight: '600',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#1565c0',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                },
                '&:disabled': {
                  bgcolor: '#707070',
                  color: '#505050',
                }
              }}
            >
              {editingProduct ? t('admin.update') : t('admin.create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default AdminProducts
