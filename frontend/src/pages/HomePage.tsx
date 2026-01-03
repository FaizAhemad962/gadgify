import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, LocalShipping, Security, Support } from '@mui/icons-material'

const HomePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const features = [
    { icon: <ShoppingCart fontSize="large" />, title: t('common.wideSelection'), desc: t('common.latestGadgets') },
    { icon: <LocalShipping fontSize="large" />, title: t('common.fastDelivery'), desc: t('common.quickDelivery') },
    { icon: <Security fontSize="large" />, title: t('common.securePayment'), desc: t('common.safeTransactions') },
    { icon: <Support fontSize="large" />, title: t('common.support247'), desc: t('common.alwaysHelp') },
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
            {t('common.discoverLatest')}
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
          {t('common.whyChooseUs')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }, minWidth: 250 }} key={index}>
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
            </Box>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight="600">
            {t('common.readyToShop')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('common.browseProducts')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
          >
            {t('common.shopNow')}
          </Button>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
