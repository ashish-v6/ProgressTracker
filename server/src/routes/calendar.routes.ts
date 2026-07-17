import { Router } from 'express';
import * as calendarController from '../controllers/calendar.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Secure all calendar endpoints
router.use(protect);

router.get('/', calendarController.getCalendar);
router.get('/tasks', calendarController.getTasksByDate);

export default router;
export const calendarRoutes = router;
