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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  category: z.string().min(2, 'Category is required'),
})

type ProductFormData = z.infer<typeof productSchema>

const AdminProducts = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const [imageTab, setImageTab] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

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
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category,
      })
      setImagePreview(product.imageUrl)
    } else {
      setEditingProduct(null)
      reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        imageUrl: '',
        category: '',
      })
      setImagePreview('')
    }
    setOpen(true)
    setError('')
    setImageFile(null)
    setImageTab(0)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingProduct(null)
    reset()
    setError('')
    setImageFile(null)
    setImagePreview('')
    setImageTab(0)
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('admin.imageSizeError'))
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

  const onSubmit = async (data: ProductFormData) => {
    let finalImageUrl = data.imageUrl || ''

    // If user uploaded a file, upload it first and get the URL
    if (imageTab === 1 && imageFile) {
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
    }

    // Validate that we have an image
    if (!finalImageUrl) {
      setError(t('admin.imageRequired'))
      return
    }

    const productData = { ...data, imageUrl: finalImageUrl }

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="600">
          {t('admin.products')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          {t('admin.addProduct')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.image')}</TableCell>
              <TableCell>{t('admin.name')}</TableCell>
              <TableCell>{t('admin.category')}</TableCell>
              <TableCell>{t('admin.price')}</TableCell>
              <TableCell>{t('admin.stock')}</TableCell>
              <TableCell align="right">{t('admin.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/50'}
                    alt={product.name}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    onError={(e) => {
                      console.error('Image load error:', product.imageUrl)
                      e.currentTarget.src = 'https://via.placeholder.com/50'
                    }}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{t(`categories.${product.category}`)}</TableCell>
                <TableCell>₹{product.price.toLocaleString()}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(product)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(product.id)}
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingProduct ? t('admin.editProduct') : t('admin.addNewProduct')}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
                  <InputLabel>{t('admin.category')}</InputLabel>
                  <Select
                    label={t('admin.category')}
                    {...register('category')}
                    defaultValue={editingProduct?.category || ''}
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
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
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('admin.productImage')}
                </Typography>
                <Tabs value={imageTab} onChange={(_, v) => setImageTab(v)} sx={{ mb: 2 }}>
                  <Tab label={t('admin.imageUrl')} />
                  <Tab label={t('admin.uploadImage')} />
                </Tabs>
                
                {imageTab === 0 ? (
                  <TextField
                    fullWidth
                    label={t('admin.imageUrl')}
                    {...register('imageUrl')}
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl?.message}
                    onChange={(e) => setImagePreview(e.target.value)}
                  />
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Upload />}
                      fullWidth
                    >
                      {t('admin.chooseImage')}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageFileChange}
                      />
                    </Button>
                    {imageFile && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {imageFile.name}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {imagePreview && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                      {t('admin.preview')}:
                    </Typography>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('admin.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
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
