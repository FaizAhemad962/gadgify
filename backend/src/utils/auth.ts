import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from '../config'

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: {
  id: string
  email: string
  role: string
}): string => {
  return jwt.sign(payload, String(config.jwtSecret), {
    expiresIn: String(config.jwtExpiresIn),
  } as SignOptions)
}
