import { Document, Model, Types } from 'mongoose';

export interface HolidayFields {
    /** 연도 */
    year: number;
    /** 월 */
    month: number;
    /** 일 */
    day: number;
    /** 주기 */
    period: number;
    /** 공휴일 이름 */
    dateName: string;
}

export interface HolidayDocument extends HolidayFields, Document {
    id: string;
    _id: string | Types.ObjectId;
}

export interface HolidayModel extends Model<HolidayDocument> {}
