import { Router } from 'express';
import { checkAuth, login, logout, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.config';


const router = Router();

router.post('/register',
  upload.single('photo'), // Middleware de multer
  register
);
router.post('/login', login);
router.post('/logout', authMiddleware, logout); // Aplicar middleware de autenticación
router.get('/check-auth', authMiddleware, checkAuth); // Aplicar middleware de autenticación

export default router;
