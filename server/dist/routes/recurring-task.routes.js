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
exports.recurringTaskRoutes = void 0;
const express_1 = require("express");
const recurringTaskController = __importStar(require("../controllers/recurring-task.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const recurring_task_validator_1 = require("../validators/recurring-task.validator");
const router = (0, express_1.Router)();
// Secure all recurring task templates endpoints
router.use(auth_middleware_1.protect);
router.post('/', (0, validation_middleware_1.validate)({ body: recurring_task_validator_1.createRecurringTaskSchema }), recurringTaskController.createRecurringTask);
router.get('/', recurringTaskController.listRecurringTasks);
router.get('/:id', recurringTaskController.getRecurringTask);
router.put('/:id', (0, validation_middleware_1.validate)({ body: recurring_task_validator_1.updateRecurringTaskSchema }), recurringTaskController.updateRecurringTask);
router.delete('/:id', recurringTaskController.deleteRecurringTask);
router.patch('/:id/pause', recurringTaskController.pauseRecurringTask);
router.patch('/:id/resume', recurringTaskController.resumeRecurringTask);
exports.default = router;
exports.recurringTaskRoutes = router;
//# sourceMappingURL=recurring-task.routes.js.map