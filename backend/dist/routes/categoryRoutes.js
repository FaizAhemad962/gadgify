"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
// Public: get active categories
router.get("/", categoryController_1.getCategories);
// Admin: get all categories (including inactive)
router.get("/all", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), categoryController_1.getAllCategories);
// Admin: CRUD
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), (0, validate_1.validate)(validators_1.createCategorySchema), categoryController_1.createCategory);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), (0, validate_1.validate)(validators_1.updateCategorySchema), categoryController_1.updateCategory);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), categoryController_1.deleteCategory);
exports.default = router;
