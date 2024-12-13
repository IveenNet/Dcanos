// src/routes/user.routes.ts
import { Router } from 'express';
import { getStylists } from '../controllers/stylist.controller';

const router = Router();

router.get('/', getStylists);

export default router;
