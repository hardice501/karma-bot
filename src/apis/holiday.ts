import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import _ from 'lodash';
import { HolidayFields } from '../models/holiday/holiday.schema.interface';
import config from '../utils/config';
import { formateDate, getPeriod } from '../utils/date.utils';
import apiClient from './nuriDataClient';

type HolidayItem = {
    dateKind: string;
    dateName: string;
    isHoliday: string;
    locdate: number;
    seq: number;
};

export type Holiday = {
    totalCount: number;
    items: HolidayFields[];
};

export async function getHoliday(year: number, month: number): Promise<Holiday> {
    const queryParams = {
        solYear: year,
        solMonth: _.padStart(month.toString(), 2, '0'),
        ServiceKey: config.get('API_KEY'),
    };
    const response = await apiClient.get('/getRestDeInfo', {
        params: queryParams,
    });
    const holidayObject = response.data.response.body;

    if (!holidayObject.items.item) {
        return {
            totalCount: 0,
            items: [],
        };
    } else {
        const items: HolidayItem[] =
            holidayObject.totalCount > 1 ? holidayObject.items.item : [holidayObject.items.item];
        return {
            totalCount: holidayObject.totalCount,
            items: items.map((item: HolidayItem) => {
                const date = formateDate(item.locdate);
                const year = format(date, 'yyyy', { locale: ko });
                const month = format(date, 'MM', { locale: ko });
                const day = format(date, 'dd', { locale: ko });
                const period = getPeriod(date);
                return {
                    year: Number(year),
                    month: Number(month),
                    day: Number(day),
                    period,
                    dateName: item.dateName,
                };
            }),
        };
    }
}

export async function getHolidays(
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number,
): Promise<Holiday> {
    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
        throw new Error('Invalid date range');
    }
    const promises: Promise<Holiday>[] = [];
    let currentYear = startYear;
    let currentMonth = startMonth;
    // 각 달에 대한 공휴일 정보를 비동기로 요청하여 Promise 배열에 저장
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        promises.push(getHoliday(currentYear, currentMonth));
        // 다음 달로 이동
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    // 모든 요청이 완료될 때까지 대기
    const holidayResults = await Promise.all(promises);
    // 결과 합치기
    const totalCount = holidayResults.reduce((acc, holiday) => acc + holiday.totalCount, 0);
    const items = holidayResults.flatMap((holiday) => holiday.items);

    return {
        totalCount,
        items,
    };
}
