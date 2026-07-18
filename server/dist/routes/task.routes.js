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
exports.taskRoutes = void 0;
const express_1 = require("express");
const taskController = __importStar(require("../controllers/task.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const task_validator_1 = require("../validators/task.validator");
const router = (0, express_1.Router)();
// Apply auth protection middleware to all task endpoints
router.use(auth_middleware_1.protect);
/**
 * @swagger
 * /api/tasks/today:
 *   get:
 *     summary: Get tasks for today
 *     tags: [Tasks]
 */
router.get('/today', taskController.getTodayTasks);
/**
 * @swagger
 * /api/tasks/upcoming:
 *   get:
 *     summary: Get tasks for upcoming days (default 7 days)
 *     tags: [Tasks]
 */
router.get('/upcoming', taskController.getUpcomingTasks);
/**
 * @swagger
 * /api/tasks/bulk-delete:
 *   post:
 *     summary: Bulk delete tasks
 *     tags: [Tasks]
 */
router.post('/bulk-delete', taskController.bulkDelete);
/**
 * @swagger
 * /api/tasks/bulk-complete:
 *   post:
 *     summary: Bulk complete tasks
 *     tags: [Tasks]
 */
router.post('/bulk-complete', taskController.bulkComplete);
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: List tasks with search, filter, paginate, sort
 *     tags: [Tasks]
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 */
router.get('/', (0, validation_middleware_1.validate)({ query: task_validator_1.queryTaskSchema }), taskController.listTasks);
router.post('/', (0, validation_middleware_1.validate)({ body: task_validator_1.createTaskSchema }), taskController.createTask);
/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get details of a single task
 *     tags: [Tasks]
 */
router.get('/:id', taskController.getTask);
router.patch('/:id', (0, validation_middleware_1.validate)({ body: task_validator_1.updateTaskSchema }), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
/**
 * @swagger
 * /api/tasks/{id}/duplicate:
 *   post:
 *     summary: Duplicate a task
 *     tags: [Tasks]
 */
router.post('/:id/duplicate', taskController.duplicateTask);
/**
 * @swagger
 * /api/tasks/{id}/complete:
 *   patch:
 *     summary: Mark a task as completed
 *     tags: [Tasks]
 */
router.patch('/:id/complete', taskController.markComplete);
/**
 * @swagger
 * /api/tasks/{id}/incomplete:
 *   patch:
 *     summary: Mark a task as incomplete (pending)
 *     tags: [Tasks]
 */
router.patch('/:id/incomplete', taskController.markIncomplete);
exports.default = router;
exports.taskRoutes = router;
//# sourceMappingURL=task.routes.js.map