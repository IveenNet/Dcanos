// src/routes/user.routes.ts
import { Router } from 'express';
import { deleteUser, getUserById, getUsers, updateUser } from '../controllers/user.controller';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
