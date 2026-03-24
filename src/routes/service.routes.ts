import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();
const controller = new ServiceController();

router.get('/', (req, res) => controller.findAll(req, res));
router.get('/admin/all', authenticate, authorize('admin'), (req, res) => controller.findAllAdmin(req, res));
router.post('/', authenticate, authorize('admin'), (req, res) => controller.create(req, res));
router.put('/:id', authenticate, authorize('admin'), (req, res) => controller.update(req, res));
router.delete('/:id', authenticate, authorize('admin'), (req, res) => controller.delete(req, res));

export default router;
