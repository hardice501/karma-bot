import { format } from 'date-fns';
import { getRestDeInfos } from '../apis/holiday';
import { Holiday } from '../models/models';
import { getPeriod, getPeriodLastFriDay, getStartAndEndPeriodMonths } from '../utils/date.utils';

// 공휴일 업데이트 (DELETE -> INSERT)

/**
 *
 * @param {Date} startYear
 * @param {Date} startMonth
 * @param {Date} endYear
 * @param {Date} endMonth
 */
export async function updateHolidays(startYear: number, startMonth: number, endYear: number, endMonth: number) {
    const holidays = await getRestDeInfos(startYear, startMonth, endYear, endMonth);
    await Holiday.deleteMany({
        year: { $gte: startYear, $lte: endYear },
        month: { $gte: startMonth, $lte: endMonth },
    });
    await Holiday.insertMany(holidays.items);
}

/**
 * @description 입력한 날짜가 마지막 평일이 맞는지 판단
 * @param {Date} date
 * @returns {boolean}
 */
export async function isLastWeekDayOfPeriod(date: Date) {
    const targetDay = Number(format(date, 'dd'));
    const period = getPeriod(date);
    const lastFriDay = getPeriodLastFriDay(period);
    const holidays = await Holiday.find({ period: period }).sort({ day: -1 }).lean().exec();
    let lastWeekDay = lastFriDay;
    holidays.forEach((holiday) => {
        if (holiday.day === lastWeekDay) {
            lastWeekDay--;
        } else {
            return;
        }
    });
    return targetDay === lastWeekDay;
}

/**
 * @description 입력한 날짜의 period에서 공휴일 업데이트가 필요하다면, 필요한 기간만큼 return. holiday polling 하기 귀찮을 것 같아서 만든 함수
 * @param {Date} date
 * @returns {null | { startYear: number; startMonth: number; endYear: number; endMonth: number }}
 */
export async function getNeedToUpdateHolidaysParams(date: Date) {
    const period = getPeriod(date);
    const { startYear, startMonth, endYear, endMonth } = getStartAndEndPeriodMonths(period);
    const endMonthHolidays = await Holiday.find({ month: endMonth, day: 0 }).lean().exec();
    const startMonthHolidays = [];

    if (startMonth !== endMonth) {
        const holidays = await Holiday.find({ month: startMonth, day: 0 }).lean().exec();
        startMonthHolidays.push(...holidays);
    }

    const startUpdatedFlag = !startMonthHolidays.length;
    const endUpdatedFlag = !endMonthHolidays.length;
    if (startUpdatedFlag || endUpdatedFlag) {
        const needUpdated = {
            startYear: startUpdatedFlag ? startYear : endYear,
            startMonth: startUpdatedFlag ? startMonth : endMonth,
            endYear: endUpdatedFlag ? endYear : startYear,
            endMonth: endUpdatedFlag ? endMonth : startMonth,
        };
        return needUpdated;
    } else {
        return null;
    }
}

export async function getHolidays(startYear: number, startMonth: number, endYear: number, endMonth: number) {
    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
        throw new Error('Invalid date range');
    }
    const holidays = await Holiday.find({
        year: { $gte: startYear, $lte: endYear },
        month: { $gte: startMonth, $lte: endMonth },
    });
    return holidays;
}
