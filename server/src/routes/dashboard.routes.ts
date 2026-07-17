import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Secure all dashboard endpoints
router.use(protect);

router.get('/', dashboardController.getDashboard);
router.get('/streak', dashboardController.getStreakData);
router.get('/productivity-score', dashboardController.getProductivityScore);
router.get('/goals', dashboardController.getGoalSummary);

export default router;
export const dashboardRoutes = router;
