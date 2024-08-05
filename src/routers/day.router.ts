import express from 'express';
import holidayRouter from './holiday.router';
const dayRouter = express.Router();

dayRouter.use('/', holidayRouter);
export default dayRouter;
