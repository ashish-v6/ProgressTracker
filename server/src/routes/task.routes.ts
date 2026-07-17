import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createTaskSchema, updateTaskSchema, queryTaskSchema } from '../validators/task.validator';

const router = Router();

// Apply auth protection middleware to all task endpoints
router.use(protect);

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
router.get('/', validate({ query: queryTaskSchema }), taskController.listTasks);
router.post('/', validate({ body: createTaskSchema }), taskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get details of a single task
 *     tags: [Tasks]
 */
router.get('/:id', taskController.getTask);
router.patch('/:id', validate({ body: updateTaskSchema }), taskController.updateTask);
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

export default router;
export const taskRoutes = router;
