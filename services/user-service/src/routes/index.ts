import { Router } from 'express';
import meRouter from './me.routes';
import gradeRouter from './grade.routes';
import pointRouter from './point.routes';
import profileRouter from './profile.routes';

const userRouter = Router();

userRouter.use('/me', meRouter);
userRouter.use('/me/grade', gradeRouter);
userRouter.use('/me/points', pointRouter);
userRouter.use('/me/profile', profileRouter);

export default userRouter;