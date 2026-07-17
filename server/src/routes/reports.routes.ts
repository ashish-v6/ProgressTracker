import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth protection middleware to all reports endpoints
router.use(protect);

router.get('/daily', reportsController.getDailyReport);
router.get('/weekly', reportsController.getWeeklyReport);
router.get('/monthly', reportsController.getMonthlyReport);

export default router;
export const reportsRoutes = router;
