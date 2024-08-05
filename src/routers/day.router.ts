import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import httpStatus from 'http-status';
import { getHoliday, getHolidays } from '../apis/holiday';
import { createDateWithKst, getPeriod } from '../utils/date.utils';
const dayRouter = express.Router();

// url: {{base_url}}/day/holiday?month=12&year=2024
dayRouter.get(
    '/holiday',
    asyncHandler(async (req: Request, res: Response) => {
        const { year, month } = req.query as { year: string; month: string };
        const holidays = await getHoliday(Number(year), Number(month));
        res.status(httpStatus.OK).json(holidays);
    }),
);

// url: {{base_url}}/day/holidays?startYear=2024&startMonth=12&endYear=2025&endMonth=01
dayRouter.get(
    '/holidays',
    asyncHandler(async (req: Request, res: Response) => {
        const { startYear, startMonth, endYear, endMonth } = req.query as {
            startYear: string;
            startMonth: string;
            endYear: string;
            endMonth: string;
        };
        const holidays = await getHolidays(Number(startYear), Number(startMonth), Number(endYear), Number(endMonth));
        res.status(httpStatus.OK).json(holidays);
    }),
);

// url: {{base_url}}/day/period?date=2024-04-14
dayRouter.get(
    '/period',
    asyncHandler(async (req: Request, res: Response) => {
        let { date } = req.query as { date: string | undefined };
        date = date ? date : new Date().toISOString();
        res.status(httpStatus.OK).json({ period: getPeriod(createDateWithKst(date)) });
    }),
);

export default dayRouter;
