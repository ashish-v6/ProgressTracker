import { Router } from 'express';
import * as timerController from '../controllers/timer.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { startTimerSchema } from '../validators/timer.validator';

const router = Router();

// Protect all timer routes
router.use(protect);

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
router.post('/start', validate({ body: startTimerSchema }), timerController.startTimer);

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

export default router;
export const timerRoutes = router;
