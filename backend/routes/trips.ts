import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { verifyTripAccess } from '../middleware/tripAccess';
import * as tripsController from '../controllers/tripsController';

const router = Router();

router.use(authenticate as any);

router.get('/', tripsController.listTrips as any);
router.post('/', tripsController.createTrip as any);
router.get('/:id', verifyTripAccess as any, tripsController.getTrip as any);
router.patch('/:id', verifyTripAccess as any, tripsController.updateTrip as any);
router.delete('/:id', verifyTripAccess as any, tripsController.deleteTrip as any);

export default router;
