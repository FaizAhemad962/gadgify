import { Box, Container, Typography, Link, Divider, IconButton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        backgroundColor: '#0f1419',
        color: '#fff',
        borderTop: '1px solid #222',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: { xs: 4, md: 5 }, py: 8 }}>
          {/* About Section */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="800" sx={{ color: '#fff', mb: 3, fontSize: '1.1rem' }}>
              🛍️ {t('app.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#a0a0a0', mb: 2.5, lineHeight: 1.8, fontSize: '0.95rem' }}>
              {t('footer.aboutDesc')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#707070', fontSize: '0.85rem', lineHeight: 1.6, display: 'block' }}>
              ✓ {t('common.availableInMaharashtra')}
            </Typography>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="800" sx={{ color: '#fff', mb: 3, fontSize: '1.1rem' }}>
              {t('footer.quickNavigation')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link 
                href="/" 
                sx={{ 
                  color: '#a0a0a0', 
                  textDecoration: 'none', 
                  fontSize: '0.95rem', 
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { 
                    color: '#ff9800',
                    transform: 'translateX(4px)',
                  } 
                }}
              >
                → {t('nav.home')}
              </Link>
              <Link 
                href="/products" 
                sx={{ 
                  color: '#a0a0a0', 
                  textDecoration: 'none', 
                  fontSize: '0.95rem', 
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { 
                    color: '#ff9800',
                    transform: 'translateX(4px)',
                  } 
                }}
              >
                → {t('nav.products')}
              </Link>
              <Link 
                href="/orders" 
                sx={{ 
                  color: '#a0a0a0', 
                  textDecoration: 'none', 
                  fontSize: '0.95rem', 
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { 
                    color: '#ff9800',
                    transform: 'translateX(4px)',
                  } 
                }}
              >
                → {t('nav.orders')}
              </Link>
            </Box>
          </Box>

          {/* Customer Support */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="800" sx={{ color: '#fff', mb: 3, fontSize: '1.1rem' }}>
              🤝 {t('footer.support')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#707070', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {t('footer.email')}
                </Typography>
                <Link 
                  href="mailto:support@gadgify.com"
                  sx={{ 
                    color: '#a0a0a0', 
                    textDecoration: 'none', 
                    fontSize: '0.95rem', 
                    display: 'block',
                    transition: 'all 0.3s',
                    '&:hover': { 
                      color: '#ff9800',
                    } 
                  }}
                >
                  support@gadgify.com
                </Link>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#707070', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {t('footer.phone')}
                </Typography>
                <Link 
                  href="tel:18008004255"
                  sx={{ 
                    color: '#a0a0a0', 
                    textDecoration: 'none', 
                    fontSize: '0.95rem', 
                    display: 'block',
                    transition: 'all 0.3s',
                    '&:hover': { 
                      color: '#ff9800',
                    } 
                  }}
                >
                  1-800-GADGIFY
                </Link>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#707070', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {t('footer.availability')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#a0a0a0', fontSize: '0.95rem' }}>
                  {t('footer.available247')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Social Media & Newsletter */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="800" sx={{ color: '#fff', mb: 3, fontSize: '1.1rem' }}>
              🌐 {t('footer.connect')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              {/* Facebook */}
              <IconButton
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#1a1f26',
                  border: '1.5px solid #333',
                  color: '#fff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: '#1877f2',
                    borderColor: '#1877f2',
                    transform: 'translateY(-3px) scale(1.1)',
                    boxShadow: '0 8px 16px rgba(24, 119, 242, 0.25)',
                  },
                }}
              >
                <Facebook sx={{ fontSize: '1.3rem' }} />
              </IconButton>
              {/* Twitter */}
              <IconButton
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#1a1f26',
                  border: '1.5px solid #333',
                  color: '#fff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: '#1da1f2',
                    borderColor: '#1da1f2',
                    transform: 'translateY(-3px) scale(1.1)',
                    boxShadow: '0 8px 16px rgba(29, 161, 242, 0.25)',
                  },
                }}
              >
                <Twitter sx={{ fontSize: '1.3rem' }} />
              </IconButton>
              {/* Instagram */}
              <IconButton
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#1a1f26',
                  border: '1.5px solid #333',
                  color: '#fff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    borderColor: '#e6683c',
                    transform: 'translateY(-3px) scale(1.1)',
                    boxShadow: '0 8px 16px rgba(230, 104, 60, 0.25)',
                  },
                }}
              >
                <Instagram sx={{ fontSize: '1.3rem' }} />
              </IconButton>
              {/* LinkedIn */}
              <IconButton
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#1a1f26',
                  border: '1.5px solid #333',
                  color: '#fff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: '#0a66c2',
                    borderColor: '#0a66c2',
                    transform: 'translateY(-3px) scale(1.1)',
                    boxShadow: '0 8px 16px rgba(10, 102, 194, 0.25)',
                  },
                }}
              >
                <LinkedIn sx={{ fontSize: '1.3rem' }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: '#222', my: 4 }} />

        {/* Bottom Footer */}
        <Box sx={{ py: 5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'auto 1fr auto' }, gap: 4, mb: 4, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#707070', fontSize: '0.9rem', fontWeight: 600 }}>
              © {new Date().getFullYear()} Gadgify • {t('footer.allRightsReserved')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Link 
                href="#" 
                sx={{ 
                  color: '#707070', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem', 
                  fontWeight: 500,
                  transition: 'all 0.3s', 
                  '&:hover': { 
                    color: '#ff9800', 
                  } 
                }}
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Typography sx={{ color: '#404040' }}>|</Typography>
              <Link 
                href="#" 
                sx={{ 
                  color: '#707070', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem', 
                  fontWeight: 500,
                  transition: 'all 0.3s', 
                  '&:hover': { 
                    color: '#ff9800', 
                  } 
                }}
              >
                {t('footer.termsOfService')}
              </Link>
              <Typography sx={{ color: '#404040' }}>|</Typography>
              <Link 
                href="#" 
                sx={{ 
                  color: '#707070', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem', 
                  fontWeight: 500,
                  transition: 'all 0.3s', 
                  '&:hover': { 
                    color: '#ff9800', 
                  } 
                }}
              >
                {t('footer.returnPolicy')}
              </Link>
            </Box>
            <Typography variant="caption" sx={{ color: '#505050', fontSize: '0.8rem', textAlign: { xs: 'center', md: 'right' } }}>
              {t('footer.madeWith')}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
