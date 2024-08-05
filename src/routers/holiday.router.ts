import { format } from 'date-fns';
import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import httpStatus from 'http-status';
import { getHolidays, updateHolidays } from '../services/holiday.service';
import { getPeriod, getStartAndEndNumberYYYYMM } from '../utils/date.utils';
const dayRouter = express.Router();

// url: {{base_url}}/day/holidays?startYear=2024&startMonth=12&endYear=2025&endMonth=01
dayRouter.get(
    '/holidays',
    asyncHandler(async (req: Request, res: Response) => {
        const { startYear, startMonth, endYear, endMonth } = req.query as {
            startYear?: string;
            startMonth?: string;
            endYear?: string;
            endMonth?: string;
        };
        const { startYearNum, startMonthNum, endYearNum, endMonthNum } = getStartAndEndNumberYYYYMM({
            startYear,
            startMonth,
            endYear,
            endMonth,
        });
        const holidays = await getHolidays(startYearNum, startMonthNum, endYearNum, endMonthNum);
        res.status(httpStatus.OK).json(holidays);
    }),
);

// url: {{base_url}}/day/period?date=2024-04-14
dayRouter.get(
    '/period',
    asyncHandler(async (req: Request, res: Response) => {
        let { date } = req.query as { date: string | undefined };
        date = date ? date : format(new Date(), 'yyyy-MM-dd');
        res.status(httpStatus.OK).json({ period: getPeriod(new Date(date)) });
    }),
);

dayRouter.post(
    '/holidays',
    asyncHandler(async (req: Request, res: Response) => {
        try {
            const { startYear, startMonth, endYear, endMonth } = req.body as {
                startYear: number;
                startMonth: number;
                endYear: number;
                endMonth: number;
            };
            await updateHolidays(startYear, startMonth, endYear, endMonth);
            res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (e) {
            const error = e as Error;
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ stack: error.stack, message: error.message });
        }
    }),
);

export default dayRouter;
