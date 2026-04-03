"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const database_1 = __importDefault(require("../config/database"));
// Get all addresses for the current user
const getAddresses = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const addresses = await database_1.default.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });
        res.json({ success: true, data: addresses });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
// Create a new address
const createAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { label, name, phone, address, city, state, pincode, isDefault } = req.body;
        // If this is the default, unset existing default
        if (isDefault) {
            await database_1.default.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        // Check if this is the first address — make it default automatically
        const count = await database_1.default.address.count({ where: { userId } });
        const shouldBeDefault = isDefault || count === 0;
        const newAddress = await database_1.default.address.create({
            data: {
                userId,
                label: label || "Home",
                name,
                phone,
                address,
                city,
                state: state || "Maharashtra",
                pincode,
                isDefault: shouldBeDefault,
            },
        });
        res.status(201).json({ success: true, data: newAddress });
    }
    catch (error) {
        next(error);
    }
};
exports.createAddress = createAddress;
// Update an address
const updateAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { label, name, phone, address, city, state, pincode, isDefault } = req.body;
        const existing = await database_1.default.address.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            res.status(404).json({ message: "Address not found" });
            return;
        }
        // If setting as default, unset other defaults
        if (isDefault && !existing.isDefault) {
            await database_1.default.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const updated = await database_1.default.address.update({
            where: { id },
            data: {
                ...(label !== undefined && { label }),
                ...(name !== undefined && { name }),
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(state !== undefined && { state }),
                ...(pincode !== undefined && { pincode }),
                ...(isDefault !== undefined && { isDefault }),
            },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
// Delete an address
const deleteAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const existing = await database_1.default.address.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            res.status(404).json({ message: "Address not found" });
            return;
        }
        await database_1.default.address.delete({ where: { id } });
        // If we deleted the default, promote the next one
        if (existing.isDefault) {
            const next = await database_1.default.address.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
            if (next) {
                await database_1.default.address.update({
                    where: { id: next.id },
                    data: { isDefault: true },
                });
            }
        }
        res.json({ success: true, message: "Address deleted" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
