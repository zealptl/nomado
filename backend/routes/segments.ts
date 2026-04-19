import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { verifyTripAccess } from '../middleware/tripAccess';
import * as segmentsController from '../controllers/segmentsController';

const router = Router();

router.use(authenticate as any);

router.get('/:id/segments', verifyTripAccess as any, segmentsController.listSegments as any);
router.post('/:id/segments', verifyTripAccess as any, segmentsController.createSegment as any);
router.patch('/:id/segments/:segId', verifyTripAccess as any, segmentsController.updateSegment as any);
router.delete('/:id/segments/:segId', verifyTripAccess as any, segmentsController.deleteSegment as any);

export default router;
