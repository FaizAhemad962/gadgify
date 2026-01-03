import { Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ErrorOutline } from '@mui/icons-material'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <ErrorOutline sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h3" gutterBottom fontWeight="600">
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go to Home
      </Button>
    </Container>
  )
}

export default NotFoundPage
