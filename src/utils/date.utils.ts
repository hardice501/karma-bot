import { addWeeks, differenceInWeeks, format, subDays, subMilliseconds } from 'date-fns';
const START_DATE = new Date('2024-04-01T00:00:00+09:00');

export interface WorkPeriodRangeProps {
    range_start: Date;
    range_end: Date;
}

export function getPeriod(date: Date): number {
    // return Math.floor(differenceInWeeks(date, START_DATE) / 2) + 1;
    const period = Math.floor(date.getTime()/86400000)
    return Math.floor((period+11)/14);
}

export function getWorkPeriodRange(inputDate: Date): WorkPeriodRangeProps {
    const date: Date = new Date(inputDate.toLocaleDateString());
    // date.setDate(inputDate.getDate() - 7);/
    const today_work_period = getPeriod(date);

    let range_start: Date = new Date(date);
    let range_end: Date = new Date(date);
    for (let i = new Date(range_start); getPeriod(i) === today_work_period; ) {
        range_start = new Date(i);
        i.setDate(i.getDate() - 1);
    }

    for (let i = range_end; getPeriod(i) === today_work_period; ) {
        range_end = new Date(i);
        i.setDate(i.getDate() + 1);
    }

    return { range_start, range_end };
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
