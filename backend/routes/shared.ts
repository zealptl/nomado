import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as sharedController from '../controllers/sharedController';

const router = Router();

router.get('/shared', authenticate as any, sharedController.getSharedTrip as any);

export default router;
