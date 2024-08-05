import { Connection, Schema } from 'mongoose';
import { AttendanceFields, AttendanceModel } from './attendance.schema.interface';

const schemaName = 'employees_attendance';
const AttendanceSchema: Schema<AttendanceFields> = new Schema(
    {
        name: { type: String, required: true, ref: 'employee' },
        /** 근태 날짜 */
        work_date: { type: 'Date', required: true },
        /** 출근 시간 */
        check_in_time: { type: Date, required: true },
        /** 퇴근 시간 */
        check_out_time: { type: Date, required: true },
        /** 상태 */
        state: { type: String, required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // createdAt, updatedAt 자동 생성
    },
);

export default function (connection: Connection) {
    return connection.model<AttendanceFields, AttendanceModel>(schemaName, AttendanceSchema);
}
