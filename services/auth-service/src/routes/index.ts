import { Router } from 'express';
import authRouter from './auth.router';
import recoveryRouter from './recovery.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/recovery', recoveryRouter);

export default router;