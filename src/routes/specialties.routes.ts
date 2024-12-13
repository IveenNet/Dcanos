import { Router } from 'express';
import { createSpecialty, getSpecialties, getSpecialtiesById } from '../controllers/specialty.controller';

const router = Router();

router.post('/', createSpecialty);
router.get('/', getSpecialties);
router.get('/:id', getSpecialtiesById);

export default router;
