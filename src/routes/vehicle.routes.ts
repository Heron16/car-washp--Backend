import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();
const controller = new VehicleController();

router.get('/mine', authenticate, (req, res) => controller.findMine(req, res));
router.get('/', authenticate, authorize('admin'), (req, res) => controller.findAll(req, res));
router.post('/', authenticate, (req, res) => controller.create(req, res));
router.put('/:id', authenticate, (req, res) => controller.update(req, res));
router.delete('/:id', authenticate, (req, res) => controller.delete(req, res));

export default router;
