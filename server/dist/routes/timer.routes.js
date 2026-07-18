"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerRoutes = void 0;
const express_1 = require("express");
const timerController = __importStar(require("../controllers/timer.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const timer_validator_1 = require("../validators/timer.validator");
const router = (0, express_1.Router)();
// Protect all timer routes
router.use(auth_middleware_1.protect);
/**
 * @swagger
 * /api/timer/status:
 *   get:
 *     summary: Retrieve active user timer details (if any)
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status', timerController.getTimerStatus);
/**
 * @swagger
 * /api/timer/start:
 *   post:
 *     summary: Start a timer session on a task
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 */
router.post('/start', (0, validation_middleware_1.validate)({ body: timer_validator_1.startTimerSchema }), timerController.startTimer);
/**
 * @swagger
 * /api/timer/pause:
 *   post:
 *     summary: Pause a running timer session
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 */
router.post('/pause', timerController.pauseTimer);
/**
 * @swagger
 * /api/timer/resume:
 *   post:
 *     summary: Resume a paused timer session
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 */
router.post('/resume', timerController.resumeTimer);
/**
 * @swagger
 * /api/timer/stop:
 *   post:
 *     summary: Stop timer, accumulate duration, and update task
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 */
router.post('/stop', timerController.stopTimer);
exports.default = router;
exports.timerRoutes = router;
//# sourceMappingURL=timer.routes.js.map