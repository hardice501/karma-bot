import { Document, Model, Types } from 'mongoose';

export enum EmployeeState {
    FULL_DAY_OFF = '연차',
    HALF_DAY_OFF = '반차',
    QUARTER_DAY_OFF = '반반차',
    OFFICAIAL_DAY_OFF = '공가',
    BUSINESS_TRIP = '출장',
}

export interface AttendanceFields {
    /** 이름 */
    name: string;
    /** 근태 날짜 */
    work_date: Date;
    /** 출근 시간 */
    check_in_time?: Date;
    /** 퇴근 시간 */
    check_out_time?: Date;
    /** 상태 */
    state: string;
}

export interface AttendanceDocument extends AttendanceFields, Document {
    _id: string | Types.ObjectId;
    updated_at: Date;
}

export interface AttendanceModel extends Model<AttendanceDocument> {}
