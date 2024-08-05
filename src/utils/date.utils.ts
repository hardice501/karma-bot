import { addWeeks, differenceInWeeks, format, subDays, subMilliseconds } from 'date-fns';
const START_DATE = new Date('2024-04-01T00:00:00+09:00');

// Get the two week period of the date
export function getPeriod(date: Date): number {
    return Math.floor(differenceInWeeks(date, START_DATE) / 2) + 1;
}

export function getOneWeekPeriod(date: Date): number {
    return Math.floor(differenceInWeeks(date, START_DATE)) + 1;
}

export function formateDate(value: number): Date {
    const dateString = value.toString();
    return new Date(dateString.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'));
}

export function getPeriodLastFriDay(period: number) {
    const startOfPeriod = addWeeks(START_DATE, (period - 1) * 2);
    const endOfPeriod = subMilliseconds(addWeeks(startOfPeriod, 2), 1);
    const lastFriDay = subDays(endOfPeriod, 2); // 기간의 마지막 금요일
    return Number(format(lastFriDay, 'dd'));
}

export function getStartAndEndPeriodMonths(period: number) {
    const startOfPeriod = addWeeks(START_DATE, (period - 1) * 2);
    const endOfPeriod = subMilliseconds(addWeeks(startOfPeriod, 2), 1);

    return {
        startYear: Number(format(startOfPeriod, 'yyyy')),
        startMonth: Number(format(startOfPeriod, 'MM')),
        endYear: Number(format(endOfPeriod, 'yyyy')),
        endMonth: Number(format(endOfPeriod, 'MM')),
    };
}

// 값이 없을 경우 default 값으로 변경 (start default: 현재날짜, end default: start 값)
export function getStartAndEndNumberYYYYMM({
    startYear,
    startMonth,
    endYear,
    endMonth,
}: {
    startYear?: string | number;
    startMonth?: string | number;
    endYear?: string | number;
    endMonth?: string | number;
}) {
    const startYearNum = startYear ? Number(startYear) : Number(format(new Date(), 'yyyy'));
    const startMonthNum = startMonth ? Number(startMonth) : Number(format(new Date(), 'MM'));
    const endYearNum = endYear ? Number(endYear) : startYearNum;
    const endMonthNum = endMonth ? Number(endMonth) : startMonthNum;
    return { startYearNum, startMonthNum, endYearNum, endMonthNum };
}
