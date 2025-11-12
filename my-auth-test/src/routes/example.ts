import { Router } from 'express';
import { ExampleController } from '../controllers/example.js';
import { validateExample } from '../middlewares/validation.js';

const router = Router();
const controller = new ExampleController();

router.get('/example', controller.getExample);
router.post('/example', validateExample, controller.createExample);

export const exampleRouter = router;