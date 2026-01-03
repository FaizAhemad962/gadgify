import { Container, Typography, Box, Button, Grid, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, LocalShipping, Security, Support } from '@mui/icons-material'

const HomePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const features = [
    { icon: <ShoppingCart fontSize="large" />, title: 'Wide Selection', desc: 'Latest electronics and gadgets' },
    { icon: <LocalShipping fontSize="large" />, title: 'Fast Delivery', desc: 'Quick delivery across Maharashtra' },
    { icon: <Security fontSize="large" />, title: 'Secure Payment', desc: 'Safe and encrypted transactions' },
    { icon: <Support fontSize="large" />, title: '24/7 Support', desc: 'Always here to help you' },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            {t('app.title')}
          </Typography>
          <Typography variant="h5" gutterBottom>
            {t('app.subtitle')}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
            Discover the latest electronics and gadgets at unbeatable prices.
            Available exclusively in Maharashtra!
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
          >
            {t('products.title')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ color: 'white', borderColor: 'white' }}
            onClick={() => navigate('/signup')}
          >
            {t('nav.signup')}
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="600">
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight="600">
            Ready to Start Shopping?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Browse our wide selection of electronics and gadgets
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
          >
            Shop Now
          </Button>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
