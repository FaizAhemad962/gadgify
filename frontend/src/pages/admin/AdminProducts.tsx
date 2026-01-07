import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Edit, Delete, Add, Upload } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { productsApi } from '../../api/products'
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
  category: z.string().min(2, 'Category is required'),
  hsnNo: z.string().optional(),
  gstPercentage: z.number().min(0).max(100).optional(),
  gstPrice: z.number().min(0).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

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

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleClose()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('admin.payloadError'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleClose()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('admin.payloadError'))
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
        gstPercentage: product.gstPercentage || undefined,
        gstPrice: product.gstPrice || undefined,
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
        category: '',
        hsnNo: '',
        gstPercentage: undefined,
        gstPrice: undefined,
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
      // Check file size: 2MB limit
      if (file.size > 2 * 1024 * 1024) {
        setError('Video size should not exceed 2MB')
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

  const onSubmit = async (data: ProductFormData) => {
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

      <TableContainer component={Paper} sx={{ bgcolor: '#242628', color: '#a0a0a0', border: '1px solid #3a3a3a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#1976d2', borderBottom: '2px solid #3a3a3a' }}>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.image')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.name')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.category')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.price')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.stock')}</TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id} sx={{ 
                borderBottom: '1px solid #3a3a3a',
                bgcolor: '#1e1e1e',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#2d3339',
                  boxShadow: 'inset 0 0 0 1px rgba(25, 118, 210, 0.2)',
                }
              }}>
                <TableCell sx={{ py: 1.5 }}>
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/50'}
                    alt={product.name}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }}
                    onError={(e) => {
                      console.error('Image load error:', product.imageUrl)
                      e.currentTarget.src = 'https://via.placeholder.com/50'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#e0e0e0', fontWeight: '500' }}>{product.name}</TableCell>
                <TableCell sx={{ color: '#b0b0b0' }}>{t(`categories.${product.category}`)}</TableCell>
                <TableCell sx={{ color: '#ff9800', fontWeight: '700' }}>₹{product.price.toLocaleString()}</TableCell>
                <TableCell sx={{ color: '#b0b0b0', fontWeight: '500' }}>{product.stock}</TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(product)}
                    sx={{
                      color: '#1976d2',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                        color: '#42a5f5',
                      }
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(product.id)}
                    sx={{
                      color: '#ef5350',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(239, 83, 80, 0.1)',
                        color: '#f44336',
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#242628',
            backgroundImage: 'none',
            border: '1px solid #3a3a3a',
            borderRadius: '12px',
          }
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ color: '#ff9800', fontWeight: '600', borderBottom: '1px solid #3a3a3a', fontSize: '1.3rem' }}>
            {editingProduct ? t('admin.editProduct') : t('admin.addNewProduct')}
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#242628', backgroundImage: 'none' }}>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#b0b0b0',
                      bgcolor: '#242628',
                      '& fieldset': { borderColor: '#3a3a3a' },
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                    '& .MuiInputBase-input::placeholder': { color: '#707070', opacity: 1 },
                    '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#b0b0b0',
                      bgcolor: '#242628',
                      '& fieldset': { borderColor: '#3a3a3a' },
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                    '& .MuiInputBase-input::placeholder': { color: '#707070', opacity: 1 },
                    '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
                  }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#b0b0b0',
                        bgcolor: '#242628',
                        '& fieldset': { borderColor: '#3a3a3a' },
                        '&:hover fieldset': { borderColor: '#1976d2' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                      '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#b0b0b0',
                        bgcolor: '#242628',
                        '& fieldset': { borderColor: '#3a3a3a' },
                        '&:hover fieldset': { borderColor: '#1976d2' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                      '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel sx={{ color: '#b0b0b0' }}>{t('admin.category')}</InputLabel>
                  <Select
                    label={t('admin.category')}
                    {...register('category')}
                    defaultValue={editingProduct?.category || ''}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                    }}
                    sx={{
                      color: '#b0b0b0',
                      bgcolor: '#242628',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3a3a3a' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
                      '.MuiSvgIcon-root': { color: '#b0b0b0' },
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

              {/* HSN No, GST %, and GST Price Section */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="HSN No."
                    placeholder="e.g., 8517.62"
                    {...register('hsnNo')}
                    error={!!errors.hsnNo}
                    helperText={errors.hsnNo?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#b0b0b0',
                        bgcolor: '#242628',
                        '& fieldset': { borderColor: '#3a3a3a' },
                        '&:hover fieldset': { borderColor: '#1976d2' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                      '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="GST %"
                    type="number"
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                    {...register('gstPercentage', { valueAsNumber: true })}
                    error={!!errors.gstPercentage}
                    helperText={errors.gstPercentage?.message || '(0-100)'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#b0b0b0',
                        bgcolor: '#242628',
                        '& fieldset': { borderColor: '#3a3a3a' },
                        '&:hover fieldset': { borderColor: '#1976d2' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                      '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
                      '& .MuiFormHelperText-root': { color: '#707070' },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="GST Price (₹)"
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    {...register('gstPrice', { valueAsNumber: true })}
                    error={!!errors.gstPrice}
                    helperText={errors.gstPrice?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#b0b0b0',
                        bgcolor: '#242628',
                        '& fieldset': { borderColor: '#3a3a3a' },
                        '&:hover fieldset': { borderColor: '#1976d2' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                      '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
                    }}
                  />
                </Box>
              </Box>

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
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '1px solid #3a3a3a' }}
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
                    <video
                      src={videoPreview}
                      controls
                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid #3a3a3a' }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#b0b0b0',
                      bgcolor: '#242628',
                      '& fieldset': { borderColor: '#3a3a3a' },
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                    '& .MuiInputBase-input::placeholder': { color: '#707070', opacity: 1 },
                    '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
                    '& .MuiFormHelperText-root': { color: '#707070' },
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#242628', borderTop: '1px solid #3a3a3a', p: 2, gap: 1 }}>
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
