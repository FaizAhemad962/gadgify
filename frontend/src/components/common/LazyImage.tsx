import { useState } from 'react'
import { Box, Skeleton } from '@mui/material'

interface LazyImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  style?: React.CSSProperties
  className?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

const LazyImage = ({
  src,
  alt,
  width = '100%',
  height = '100%',
  style,
  className,
  objectFit = 'cover',
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <Box sx={{ position: 'relative', width, height, overflow: 'hidden' }}>
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      {error ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
            color: 'grey.500',
            fontSize: '0.875rem',
          }}
        >
          No Image
        </Box>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            ...style,
          }}
          className={className}
        />
      )}
    </Box>
  )
}

export default LazyImage
