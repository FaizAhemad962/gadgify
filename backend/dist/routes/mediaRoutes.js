"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediaController_1 = require("../controllers/mediaController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
console.log("HERE IN MEDIA ROUTES");
router.delete("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), mediaController_1.deleteMediaByUrlAndProductId);
exports.default = router;
