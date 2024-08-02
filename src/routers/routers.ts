import express from 'express';
import hcRouter from './hc.router';

const rootRouter = express.Router();

rootRouter.use('/hc', hcRouter);

export default rootRouter;
