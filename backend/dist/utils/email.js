"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewsletterWelcomeEmail = exports.sendLowStockAlertEmail = exports.sendOrderStatusEmail = exports.sendPaymentSuccessEmail = exports.sendOrderConfirmationEmail = exports.sendWelcomeEmail = exports.sendPasswordResetEmail = void 0;
const resend_1 = require("resend");
const config_1 = require("../config");
const logger_1 = __importDefault(require("./logger"));
let resend = null;
const getResendClient = () => {
    if (!resend) {
        if (!config_1.config.resendApiKey) {
            throw new Error("RESEND_API_KEY is not configured. Set it in your .env file.");
        }
        resend = new resend_1.Resend(config_1.config.resendApiKey);
    }
    return resend;
};
// ── Shared email wrapper ──────────────────────────────────────────
const brandColor = "#FF6B2C";
const emailLayout = (body) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #1B2A4A; font-size: 24px; margin: 0;">Gadgify</h1>
    </div>
    ${body}
    <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;" />
    <p style="color: #a8a29e; font-size: 11px; text-align: center;">
      &copy; ${new Date().getFullYear()} Gadgify. All rights reserved.
    </p>
  </div>
`;
const sendEmail = async (to, subject, html) => {
    const { error } = await getResendClient().emails.send({
        from: config_1.config.emailFrom,
        to,
        subject,
        html,
    });
    if (error) {
        logger_1.default.error(`Failed to send email "${subject}" to ${to}: ${error.message}`);
        throw new Error(`Failed to send email: ${subject}`);
    }
    logger_1.default.info(`Email "${subject}" sent to ${to}`);
};
// ── Password Reset ────────────────────────────────────────────────
const sendPasswordResetEmail = async (to, resetToken) => {
    const resetUrl = `${config_1.config.frontendUrl}/reset-password?token=${resetToken}`;
    await sendEmail(to, "Reset Your Password — Gadgify", emailLayout(`
    <h2 style="color: #1B2A4A; font-size: 20px; margin-bottom: 12px;">Reset Your Password</h2>
    <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
      We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" style="background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color: #a8a29e; font-size: 12px; line-height: 1.5;">
      If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
    </p>
  `));
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// ── Welcome Email ─────────────────────────────────────────────────
const sendWelcomeEmail = async (to, name) => {
    await sendEmail(to, "Welcome to Gadgify! 🎉", emailLayout(`
    <h2 style="color: #1B2A4A; font-size: 20px; margin-bottom: 12px;">Welcome, ${name}!</h2>
    <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
      Your account has been created successfully. Start exploring the best electronics deals in Maharashtra.
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${config_1.config.frontendUrl}/products" style="background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        Browse Products
      </a>
    </div>
  `));
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendOrderConfirmationEmail = async (to, order) => {
    const itemRows = order.items
        .map((item) => `
      <tr>
        <td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
        <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: center; border-bottom: 1px solid #f0f0f0;">x${item.quantity}</td>
        <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right; border-bottom: 1px solid #f0f0f0;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`)
        .join("");
    const discountRow = order.discount > 0
        ? `<tr>
        <td colspan="2" style="padding: 4px 0; color: #28a745; font-size: 14px;">Discount${order.couponCode ? ` (${order.couponCode})` : ""}</td>
        <td style="padding: 4px 0; color: #28a745; font-size: 14px; text-align: right;">-₹${order.discount.toFixed(2)}</td>
      </tr>`
        : "";
    await sendEmail(to, `Order Confirmed — #${order.orderId.slice(-8).toUpperCase()}`, emailLayout(`
    <h2 style="color: #1B2A4A; font-size: 20px; margin-bottom: 12px;">Order Confirmed!</h2>
    <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
      Hi ${order.userName}, your order has been placed successfully. Please complete payment to proceed.
    </p>
    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #888; font-size: 12px; margin: 0 0 12px;">Order ID: <strong style="color: #333;">${order.orderId}</strong></p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px 0; color: #888; font-size: 12px; border-bottom: 2px solid #e0e0e0;">Item</th>
            <th style="text-align: center; padding: 8px 0; color: #888; font-size: 12px; border-bottom: 2px solid #e0e0e0;">Qty</th>
            <th style="text-align: right; padding: 8px 0; color: #888; font-size: 12px; border-bottom: 2px solid #e0e0e0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #e0e0e0;">
        <table style="width: 100%;">
          <tr>
            <td colspan="2" style="padding: 4px 0; color: #666; font-size: 14px;">Subtotal</td>
            <td style="padding: 4px 0; color: #666; font-size: 14px; text-align: right;">₹${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 4px 0; color: #666; font-size: 14px;">Shipping</td>
            <td style="padding: 4px 0; color: #666; font-size: 14px; text-align: right;">₹${order.shipping.toFixed(2)}</td>
          </tr>
          ${discountRow}
          <tr>
            <td colspan="2" style="padding: 8px 0; color: #1B2A4A; font-size: 16px; font-weight: 700;">Total</td>
            <td style="padding: 8px 0; color: #1B2A4A; font-size: 16px; font-weight: 700; text-align: right;">₹${order.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${config_1.config.frontendUrl}/orders" style="background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        View Order
      </a>
    </div>
  `));
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
// ── Payment Success ───────────────────────────────────────────────
const sendPaymentSuccessEmail = async (to, data) => {
    await sendEmail(to, `Payment Received — #${data.orderId.slice(-8).toUpperCase()}`, emailLayout(`
    <h2 style="color: #28a745; font-size: 20px; margin-bottom: 12px;">Payment Successful! ✅</h2>
    <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
      Hi ${data.userName}, we've received your payment of <strong>₹${data.total.toFixed(2)}</strong>. Your order is now being processed.
    </p>
    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Order ID: <strong style="color: #333;">${data.orderId}</strong></p>
      <p style="color: #888; font-size: 12px; margin: 0;">Payment ID: <strong style="color: #333;">${data.paymentId}</strong></p>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${config_1.config.frontendUrl}/orders" style="background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        Track Order
      </a>
    </div>
  `));
};
exports.sendPaymentSuccessEmail = sendPaymentSuccessEmail;
// ── Order Status Update ───────────────────────────────────────────
const statusLabels = {
    PROCESSING: {
        label: "Processing",
        color: "#1F90D8",
        description: "Your order is being prepared.",
    },
    SHIPPED: {
        label: "Shipped",
        color: "#FF9900",
        description: "Your order has been shipped and is on its way!",
    },
    DELIVERED: {
        label: "Delivered",
        color: "#28a745",
        description: "Your order has been delivered. Enjoy!",
    },
    CANCELLED: {
        label: "Cancelled",
        color: "#dc3545",
        description: "Your order has been cancelled.",
    },
};
const sendOrderStatusEmail = async (to, data) => {
    const info = statusLabels[data.status];
    if (!info)
        return; // Don't send email for unknown statuses
    await sendEmail(to, `Order ${info.label} — #${data.orderId.slice(-8).toUpperCase()}`, emailLayout(`
    <h2 style="color: ${info.color}; font-size: 20px; margin-bottom: 12px;">Order ${info.label}</h2>
    <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
      Hi ${data.userName}, ${info.description}
    </p>
    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #888; font-size: 12px; margin: 0;">Order ID: <strong style="color: #333;">${data.orderId}</strong></p>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${config_1.config.frontendUrl}/orders" style="background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        View Order
      </a>
    </div>
  `));
};
exports.sendOrderStatusEmail = sendOrderStatusEmail;
const sendLowStockAlertEmail = async (to, products) => {
    const rows = products
        .map((p) => `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #333;">${p.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center; color: ${p.stock === 0 ? "#DC2626" : "#F59E0B"}; font-weight: 700;">${p.stock}</td>
        </tr>`)
        .join("");
    await sendEmail(to, `⚠️ Low Stock Alert — ${products.length} product(s) need attention`, emailLayout(`
    <h2 style="color: #F59E0B; font-size: 20px; margin-bottom: 12px;">⚠️ Low Stock Alert</h2>
    <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
      The following products have low stock levels after a recent order:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f5f5f4;">
          <th style="padding: 8px 12px; text-align: left; color: #333; font-size: 13px;">Product</th>
          <th style="padding: 8px 12px; text-align: center; color: #333; font-size: 13px;">Remaining</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${config_1.config.frontendUrl}/admin/products" style="background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        Manage Products
      </a>
    </div>
  `));
};
exports.sendLowStockAlertEmail = sendLowStockAlertEmail;
// ── Newsletter Subscription ───────────────────────────────────────
const sendNewsletterWelcomeEmail = async (to) => {
    const unsubscribeUrl = `${config_1.config.frontendUrl}/newsletters/unsubscribe?email=${encodeURIComponent(to)}`;
    await sendEmail(to, "Welcome to Gadgify Newsletter! 📰", emailLayout(`
    <h2 style="color: #1B2A4A; font-size: 20px; margin-bottom: 12px;">You're In! 🎉</h2>
    <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
      Thank you for subscribing to the Gadgify newsletter. Get ready to receive exclusive deals, new arrivals, and tech tips straight to your inbox!
    </p>
    <div style="background: #f5f5f4; border-left: 4px solid ${brandColor}; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="color: #1B2A4A; font-size: 14px; font-weight: 700; margin: 0 0 8px;">What to expect:</p>
      <ul style="color: #57534e; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Exclusive deals and discounts available only to subscribers</li>
        <li>Early access to new product launches</li>
        <li>Technology tips and product recommendations</li>
        <li>Special festival and seasonal offers</li>
      </ul>
    </div>
    <p style="color: #57534e; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      We respect your inbox and will only send you relevant content. You can unsubscribe anytime.
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${config_1.config.frontendUrl}/products" style="background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        Start Shopping
      </a>
    </div>
    <p style="color: #a8a29e; font-size: 11px; line-height: 1.5; text-align: center; margin-top: 24px;">
      <a href="${unsubscribeUrl}" style="color: #888; text-decoration: none;">Unsubscribe from newsletter</a>
    </p>
  `));
};
exports.sendNewsletterWelcomeEmail = sendNewsletterWelcomeEmail;
