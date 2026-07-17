import { Router } from 'express';
import * as recurringTaskController from '../controllers/recurring-task.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createRecurringTaskSchema, updateRecurringTaskSchema } from '../validators/recurring-task.validator';

const router = Router();

// Secure all recurring task templates endpoints
router.use(protect);

router.post('/', validate({ body: createRecurringTaskSchema }), recurringTaskController.createRecurringTask);
router.get('/', recurringTaskController.listRecurringTasks);
router.get('/:id', recurringTaskController.getRecurringTask);
router.put('/:id', validate({ body: updateRecurringTaskSchema }), recurringTaskController.updateRecurringTask);
router.delete('/:id', recurringTaskController.deleteRecurringTask);
router.patch('/:id/pause', recurringTaskController.pauseRecurringTask);
router.patch('/:id/resume', recurringTaskController.resumeRecurringTask);

export default router;
export const recurringTaskRoutes = router;
