import { Router } from 'express';
import * as statisticsController from '../controllers/statistics.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Secure all statistics endpoints
router.use(protect);

router.get('/today', statisticsController.getTodayStats);
router.get('/weekly', statisticsController.getWeeklyStats);
router.get('/monthly', statisticsController.getMonthlyStats);
router.get('/yearly', statisticsController.getYearlyStats);
router.get('/category', statisticsController.getCategoryStats);

export default router;
export const statisticsRoutes = router;
