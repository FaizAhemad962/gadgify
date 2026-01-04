import Razorpay from 'razorpay'
import { config } from './index'

export const razorpayInstance = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
})
