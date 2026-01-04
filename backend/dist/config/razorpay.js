"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayInstance = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const index_1 = require("./index");
exports.razorpayInstance = new razorpay_1.default({
    key_id: index_1.config.razorpayKeyId,
    key_secret: index_1.config.razorpayKeySecret,
});
