import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure uploads directory exists
// Use Render's persistent disk in production, local path in development
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? '/var/data/uploads' 
  : path.join(__dirname, '../../uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const prefix = file.fieldname === 'image' ? 'profile-' : 'product-'
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter for images
const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'))
  }
}

// File filter for videos
const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = /video/.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only video files are allowed!'))
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images (profile + product)
  },
  fileFilter: imageFileFilter,
})

export const videoUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: videoFileFilter,
})
