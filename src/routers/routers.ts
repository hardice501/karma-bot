import express from 'express';
import dayRouter from './day.router';
import hcRouter from './hc.router';

const rootRouter = express.Router();

rootRouter.use('/hc', hcRouter);
rootRouter.use('/day', dayRouter);
export default rootRouter;
