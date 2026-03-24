import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();
const controller = new UserController();

router.post('/register', (req, res) => controller.register(req, res));
router.get('/', authenticate, authorize('admin'), (req, res) => controller.findAll(req, res));
router.get('/:id', authenticate, (req, res) => controller.findById(req, res));
router.put('/:id', authenticate, (req, res) => controller.update(req, res));
router.delete('/:id', authenticate, authorize('admin'), (req, res) => controller.delete(req, res));

export default router;
