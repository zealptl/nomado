import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { verifyTripAccess } from '../middleware/tripAccess';
import * as itemsController from '../controllers/itemsController';

const router = Router();

router.use(authenticate as any);

router.get('/:id/items', verifyTripAccess as any, itemsController.listItems as any);
router.post('/:id/items', verifyTripAccess as any, itemsController.createItem as any);
// reorder must come before /:itemId to avoid 'reorder' being captured as itemId
router.patch('/:id/items/reorder', verifyTripAccess as any, itemsController.reorderItems as any);
router.patch('/:id/items/:itemId', verifyTripAccess as any, itemsController.updateItem as any);
router.delete('/:id/items/:itemId', verifyTripAccess as any, itemsController.deleteItem as any);

export default router;
