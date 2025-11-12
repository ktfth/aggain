import express from 'express';
import { ProfileController } from './profile.controller.js';
const router = express.Router();
router.post('/api/users/profile', ProfileController.create);
router.get('/api/users/profile', ProfileController.getAll);
router.get('/api/users/profile/:id', ProfileController.getById);
router.put('/api/users/profile/:id', ProfileController.update);
router.delete('/api/users/profile/:id', ProfileController.delete);
export default router;
//# sourceMappingURL=profile.routes.js.map