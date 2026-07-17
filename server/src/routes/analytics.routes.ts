import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Retrieve charts data (daily/weekly/monthly completion rate, averages, heatmap, and category breakdown)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', analyticsController.getAnalytics);

export default router;
export const analyticsRoutes = router;
