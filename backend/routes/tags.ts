import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { verifyTripAccess } from '../middleware/tripAccess';
import * as tagsController from '../controllers/tagsController';

const router = Router();

router.use(authenticate as any);

router.get('/:id/tags', verifyTripAccess as any, tagsController.listTags as any);
router.post('/:id/tags', verifyTripAccess as any, tagsController.createTag as any);
router.delete('/:id/tags/:tagId', verifyTripAccess as any, tagsController.deleteTag as any);

export default router;
