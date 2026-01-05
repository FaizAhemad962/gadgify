import React, { useState } from 'react'
import {
  Box,
  IconButton,
  Typography,
  Modal,
} from '@mui/material'
import { ChevronLeft, ChevronRight, Close, PlayArrow } from '@mui/icons-material'

interface CarouselItem {
  type: 'image' | 'video'
  url: string
  alt?: string
}

interface ProductCarouselProps {
  items: CarouselItem[]
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ items }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalActiveStep, setModalActiveStep] = useState(0)

  const handleThumbnailClick = (index: number) => {
    setModalActiveStep(index)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
  }

  const handleModalNext = () => {
    setModalActiveStep((prev) => (prev + 1) % items.length)
  }

  const handleModalBack = () => {
    setModalActiveStep((prev) => (prev === 0 ? items.length - 1 : prev - 1))
  }

  const thumbsScrollRef = React.useRef<HTMLDivElement>(null)

  const handleThumbsScroll = (direction: 'left' | 'right') => {
    if (thumbsScrollRef.current) {
      const scrollAmount = 200
      if (direction === 'left') {
        thumbsScrollRef.current.scrollLeft -= scrollAmount
      } else {
        thumbsScrollRef.current.scrollLeft += scrollAmount
      }
    }
  }

  if (items.length === 0) {
    return (
      <Box sx={{ maxWidth: 350, width: '100%', bgcolor: '#f5f5f5', borderRadius: 2, height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No images available</Typography>
      </Box>
    )
  }

  // Always show the first item as main image
  const mainItem = items[0]
  const currentModalItem = items[modalActiveStep]

  return (
    <Box sx={{ maxWidth: 350, width: '100%' }}>
      {/* Main Image Display - No Arrows */}
      <Box
        sx={{
          width: '100%',
          height: 0,
          paddingBottom: '130%',
          position: 'relative',
          bgcolor: 'transparent',
        }}
      >
        {mainItem.type === 'image' ? (
          <img
            src={mainItem.url}
            alt={mainItem.alt || 'Product image'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <video
            src={mainItem.url}
            controls
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </Box>

      {/* Thumbnail Strip Below with Navigation Arrows */}
      {items.length > 1 && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 5 }}>
          {/* Left Arrow for Thumbnails */}
          <IconButton
            onClick={() => handleThumbsScroll('left')}
            size="small"
            sx={{
              bgcolor: '#f0f0f0',
              '&:hover': {
                bgcolor: '#e0e0e0',
              },
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Thumbnails Container */}
          <Box
            ref={thumbsScrollRef}
            sx={{
              display: 'flex',
              gap: 2.5,
              overflowX: 'auto',
              pb: 1,
              flex: 1,
              width: { xs: '240px', sm: '360px', md: '480px' },
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#888',
                borderRadius: '3px',
              },
            }}
          >
            {items.map((item, index) => (
              <Box
                key={index}
                onClick={() => handleThumbnailClick(index)}
                sx={{
                  minWidth: 100,
                  width: 100,
                  height: 100,
                  borderRadius: 1,
                  border: 'none',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  bgcolor: '#fff',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '2px',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#000',
                      position: 'relative',
                    }}
                  >
                    <PlayArrow
                      sx={{
                        fontSize: '3rem',
                        color: '#fff',
                        opacity: 0.9,
                      }}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Right Arrow for Thumbnails */}
          <IconButton
            onClick={() => handleThumbsScroll('right')}
            size="small"
            sx={{
              bgcolor: '#f0f0f0',
              '&:hover': {
                bgcolor: '#e0e0e0',
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}

      {/* Modal Lightbox */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.9)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '95vw', sm: '90vw', md: '85vw' },
            height: { xs: '85vh', sm: '90vh', md: '92vh' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleModalClose}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              zIndex: 100,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.4)',
              },
            }}
          >
            <Close sx={{ fontSize: '2rem' }} />
          </IconButton>

          {/* Main Modal Content */}
          {currentModalItem.type === 'image' ? (
            <img
              src={currentModalItem.url}
              alt={currentModalItem.alt || 'Product'}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <video
              src={currentModalItem.url}
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          )}

          {/* Back Button */}
          <IconButton
            onClick={handleModalBack}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.4)',
              },
            }}
          >
            <ChevronLeft sx={{ fontSize: '2.5rem' }} />
          </IconButton>

          {/* Next Button */}
          <IconButton
            onClick={handleModalNext}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.4)',
              },
            }}
          >
            <ChevronRight sx={{ fontSize: '2.5rem' }} />
          </IconButton>

          {/* Counter at Bottom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 30,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              px: 3,
              py: 1,
              borderRadius: 2,
              zIndex: 50,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {modalActiveStep + 1} / {items.length}
            </Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}
