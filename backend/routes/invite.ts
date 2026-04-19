import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { verifyTripAccess, requireOwner } from '../middleware/tripAccess';
import * as inviteController from '../controllers/inviteController';

const router = Router();

// Trips-scoped invite routes — owner only
router.post('/trips/:id/invite', authenticate as any, verifyTripAccess as any, requireOwner as any, inviteController.generateInvite as any);
router.post('/trips/:id/invite/refresh', authenticate as any, verifyTripAccess as any, requireOwner as any, inviteController.refreshInvite as any);

// Public-ish accept route — auth handled inside the controller
router.post('/invite/accept', inviteController.acceptInvite as any);

export default router;
