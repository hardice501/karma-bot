import { Attendance } from '../models/models';
import { getWorkPeriodRange, WorkPeriodRangeProps } from '../utils/date.utils';
import { AttendanceDocument, AttendanceFields } from '../models/attendance/attendance.schema.interface';
import { FlattenMaps } from 'mongoose';
import MongoConnection from '../resources/karmaCalculator.mongo.connection';
import { getMailPlugData } from '../utils/mailplug';

async function getEmployeeAttendanceOnDb(employee_name? : string, attendanceRange?: WorkPeriodRangeProps): Promise<AttendanceFields[]> {
    const today = new Date();
    const working_period = attendanceRange ? attendanceRange : getWorkPeriodRange(today);

    const attendance = await Attendance.find({
        work_date: {
            ...(working_period.range_start && { $gte: working_period.range_start }),
            ...(working_period.range_end && { $lte: working_period.range_end }),
        },
        ...(employee_name && { name: employee_name }),
    }).lean();

    if (!attendance){
        throw Error;
    }

    return attendance;
}

async function getEmployeeAttendanceOnMailPlug(employee_name? : string, attendanceRange?: WorkPeriodRangeProps): Promise<AttendanceFields[]> {
    const today = new Date();
    const working_period = attendanceRange ? attendanceRange : getWorkPeriodRange(today);
    const mailplug_data = await getMailPlugData(working_period, employee_name);
    const attendances: AttendanceFields[] = [];

    mailplug_data.forEach(value => {
        if(value.length === 7) {
            const name = value[1].split(' ')[0];
            const check_in_time: Date = new Date(`${value[0]} ${value[3]}`)
            let isValidCheckOut: boolean;
            let check_out_time: Date;
            if (value[4].includes(')')) {
                isValidCheckOut = false;
                const parts = value[4].split('(');
                const result = parts.flatMap(part => part.split(')'));
                const finalResult = result.filter(part => part !== '');
                const month_day = finalResult[0].split('-');
                const time = finalResult[1];

                check_out_time = new Date(`${check_in_time.getFullYear()}-${month_day[0]}-${month_day[1]} ${time}`)
            } else if (value[4] === '-') {
                isValidCheckOut = false;
                check_out_time = new Date(`${value[4]}`)
            } else {
                isValidCheckOut = true;
                check_out_time = new Date(`${value[0]} ${value[4]}`)
            }

            attendances.push({
                check_in_time: Number.isNaN(check_in_time.getTime()) ? undefined : check_in_time,
                check_out_time: Number.isNaN(check_out_time.getTime()) ? undefined : check_out_time,
                name: name,
                state: `${value[6]}`,
                work_date: new Date(value[0])
            });
        }
    });

    const session = await MongoConnection.startSession();
    session.startTransaction();
    try {
        await Attendance.bulkWrite(
            attendances.map((attendance) => {
                const { name, work_date, ...rest } = attendance;
                return {
                    updateOne: {
                        filter: { name, work_date },
                        update: rest,
                        upsert: true,
                    },
                };
            }),
            { session },
        );
        await session.commitTransaction();
    } catch (error: unknown) {
        console.log(error);
        console.log(JSON.stringify(error));
        await session.abortTransaction();
        throw new Error('Failed to update candidates');
    } finally {
        await session.endSession();
    }

    return attendances;
}

const attendanceService = {
    getEmployeeAttendanceOnDb,
    getEmployeeAttendanceOnMailPlug,
};



export default attendanceService;
