import { differenceInWeeks } from 'date-fns/differenceInWeeks';
const KST_OFFSET = 9 * 60 * 60 * 1000;
const START_DATE = new Date('2024-04-01T00:00:00+09:00');

export function getPeriod(date: Date): number {
    return Math.floor(differenceInWeeks(date, START_DATE) / 2) + 1;
}

export function createDateWithKst(dateString: string) {
    const date = new Date(dateString);
    return new Date(date.getTime() + KST_OFFSET);
}

export function formateDate(value: number): Date {
    const dateString = value.toString();
    return createDateWithKst(dateString.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'));
}
