import { FlattenMaps } from 'mongoose';
import DataBaseException from '../exceptions/DataBaseException';
import InternalErrorException from '../exceptions/InternalErrorException';
import NotFoundException from '../exceptions/NotFoundException';
import { AttendanceDocument, AttendanceFields } from '../models/attendance/attendance.schema.interface';
import { Attendance } from '../models/models';
import MongoConnection from '../resources/karmaCalculator.mongo.connection';
import config from '../utils/config';
import { WorkPeriodRangeProps, getWorkPeriodRange } from '../utils/date.utils';
import { getMailPlugData } from '../utils/mailplug';

async function getEmployeeKarma(
    employee_name: string,
    attendanceRange?: WorkPeriodRangeProps,
    retry_cnt?: number,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
    const working_period = attendanceRange ? attendanceRange : getWorkPeriodRange(new Date());
    const attendanceList = await getEmployeeAttendanceOnDb(employee_name, working_period);

    const lunchTimeStart = config.get('LUNCHTIME_START')!;
    const lunchTimeEnd = config.get('LUNCHTIME_END')!;
    let breakTime = 0;
    const check_in_min_time = config.get('CHECKIN_MIN_TIME')!;
    const check_out_max_time = config.get('CHECKOUT_MAX_TIME')!;

    // 필요한 날짜 범위
    const daylist: number[] = [];
    const idx = new Date(working_period.range_start);
    while (true) {
        if (
            idx.getTime() >=
            Math.min(working_period.range_end.getTime(), new Date(new Date().toLocaleString()).getTime())
        ) {
            break;
        }

        if (idx.getDay() !== 0 && idx.getDay() !== 6) {
            daylist.push(new Date(idx.toLocaleDateString()).getTime());
        }
        idx.setDate(idx.getDate() + 1);
    }
    // 없는 데이터 메일플러그 불러오기
    const emptyDays: number[] = [];

    attendanceList.forEach((attendance) => {
        //오늘이 아니고 퇴근시간이 포함되어 있으면?
        if (
            (attendance.work_date.toLocaleDateString() !== new Date().toLocaleDateString() &&
                attendance.check_out_time) ||
            (attendance.work_date.toLocaleDateString() === new Date().toLocaleDateString() && attendance.check_in_time)
        ) {
            const day = new Date(attendance.work_date.toLocaleDateString()).getTime();
            const index = daylist.findIndex((d) => d === day);
            if (index !== -1) {
                daylist.splice(index, 1);
            }
            //오늘이고 출근시간이 포함되어 있으면?
        } else {
            emptyDays.push(attendance.work_date.getTime());
        }
    });

    daylist.forEach((day) => {
        if (!emptyDays.includes(day)) {
            emptyDays.push(day);
        }
    });

    if (emptyDays.length > 0) {
        const fetchRange: WorkPeriodRangeProps = {
            range_start: new Date(Math.min(...emptyDays)),
            range_end: new Date(Math.max(...emptyDays)),
        };
        const retryCnt = !retry_cnt ? 1 : retry_cnt + 1;
        await getEmployeeAttendanceOnMailPlug(employee_name, fetchRange);
        if (retryCnt < 2) {
            return await getEmployeeKarma(employee_name, attendanceRange, retryCnt);
        } else {
            throw new InternalErrorException('mailplug crawler error occure');
        }
    }

    let today_check_in_time: Date | undefined;
    const workingTimes = attendanceList.map((attendance) => {
        const workday = attendance.work_date.toLocaleDateString();

        let working_time = 0;
        let real_working_time = 0;
        let check_in_time = attendance.check_in_time;
        let check_out_time = attendance.check_out_time;

        if (attendance.check_in_time && attendance.check_out_time) {
            const break_time_start = new Date(`${workday} ${lunchTimeStart}`);
            const break_time_end = new Date(`${workday} ${lunchTimeEnd}`);

            check_in_time = attendance.check_in_time;
            check_out_time = attendance.check_out_time;

            // console.log('workday', workday);
            // console.log('check_in_time', check_in_time.toLocaleDateString(), check_in_time.toLocaleTimeString());
            // console.log('check_out_time', check_out_time.toLocaleDateString(), check_out_time.toLocaleTimeString());
            // console.log('break_time_start', break_time_start.toLocaleDateString(), break_time_start.toLocaleTimeString());
            // console.log('break_time_end', break_time_end.toLocaleDateString(), break_time_end.toLocaleTimeString());

            if (check_in_time < new Date(`${workday} ${check_in_min_time}`)) {
                check_in_time = new Date(`${workday} ${check_in_min_time}`);
            }
            if (check_out_time > new Date(`${workday} ${check_out_max_time}`)) {
                check_out_time = new Date(`${workday} ${check_out_max_time}`);
            }

            if (check_in_time <= break_time_start) {
                breakTime = break_time_end.getTime() - break_time_start.getTime();
            } else if (check_in_time > break_time_end) {
                breakTime = 0;
            } else {
                breakTime = break_time_end.getTime() - check_in_time.getTime();
            }

            working_time = check_out_time.getTime() - check_in_time.getTime() - breakTime;

            real_working_time = working_time;
            if (working_time > 10 * 60 * 60 * 1000) {
                working_time = 10 * 60 * 60 * 1000;
            }
        } else if (attendance.work_date.toLocaleDateString() === new Date().toLocaleDateString()) {
            today_check_in_time = attendance.check_in_time;
        }

        const attendance_state = attendance.state.replace(' ', '').replace('\r', '').replace('\n', '');
        if (attendance_state.includes('연차')) {
            const vacation = attendance_state.split('-')[1];
            if (vacation.includes('종일')) {
                working_time = working_time + 8 * 60 * 60 * 1000;
            } else if (vacation.includes('반차')) {
                working_time = working_time + 4 * 60 * 60 * 1000;
            } else if (vacation.includes('반반차')) {
                working_time = working_time + 2 * 60 * 60 * 1000;
            }
        } else if (attendance_state.includes('공가')) {
            working_time = working_time + 8 * 60 * 60 * 1000;
        }

        return {
            work_date: workday,
            check_in_time: check_in_time,
            check_out_time: check_out_time,
            working_time: working_time / 1000,
            details: {
                real_working_time: real_working_time / 1000,
                overflow_working_time: (real_working_time - working_time) / 1000,
            },
        };
    });

    let sum_of_working_time = 0;
    workingTimes.forEach((workingTime) => {
        sum_of_working_time += workingTime?.working_time || 0;
    });
    const sumOfWorkingTime = new Date(sum_of_working_time * 1000);
    const karma_time =
        sum_of_working_time - Math.floor((Date.now() - working_period.range_start.getTime()) / 86400000) * 8 * 3600;

    let remain_woring_time = 0;
    let remain_karma_time_if_check_out_now = 0;
    let check_out_time_if_use_karma = 0;
    let check_out_time = 0;

    if (!today_check_in_time) {
        throw new DataBaseException('need today_check_in_time');
    } else {
        check_out_time_if_use_karma =
            today_check_in_time.getTime() - karma_time * 1000 + 8 * 60 * 60 * 1000 + breakTime;
        remain_karma_time_if_check_out_now = Math.floor(
            (8 * 60 * 60 * 1000 + breakTime - (Date.now() - today_check_in_time.getTime()) + karma_time * 1000) / 1000,
        );
        remain_woring_time = Math.floor(
            (today_check_in_time.getTime() + breakTime + 8 * 60 * 60 * 1000 - Date.now()) / 1000,
        );
        check_out_time = today_check_in_time.getTime() + breakTime + 8 * 60 * 60 * 1000;
    }

    return {
        employee_name: employee_name,
        check_out_time: new Date(check_out_time),
        check_out_time_if_use_karma: new Date(check_out_time_if_use_karma),
        remain_working_time: {
            total: remain_woring_time,
            hours: Math.floor(Math.abs(remain_woring_time) / 3600),
            minutes: Math.floor(Math.abs(remain_woring_time) / 60) % 60,
            seconds: Math.abs(remain_woring_time) % 60,
        },
        remain_karma_time_if_check_out_now: {
            total: remain_karma_time_if_check_out_now,
            isKarma: remain_karma_time_if_check_out_now < 0,
            hours: Math.floor(Math.abs(remain_karma_time_if_check_out_now) / 3600),
            minutes: Math.floor(Math.abs(remain_karma_time_if_check_out_now) / 60) % 60,
            seconds: Math.abs(remain_karma_time_if_check_out_now) % 60,
        },
        karma: {
            total: karma_time,
            isKarma: karma_time < 0,
            hours: Math.floor(Math.abs(karma_time) / 3600),
            minutes: Math.floor(Math.abs(karma_time) / 60) % 60,
            seconds: Math.abs(karma_time) % 60,
        },
        sum_of_working_time: {
            total: sum_of_working_time,
            hours: Math.floor(sum_of_working_time / 3600),
            minutes: sumOfWorkingTime.getMinutes(),
            seconds: sumOfWorkingTime.getSeconds(),
        },
        detail_attendance: workingTimes,
    };
}

async function getEmployeeAttendanceOnDb(
    employee_name?: string,
    attendanceRange?: WorkPeriodRangeProps,
): Promise<AttendanceFields[]> {
    const working_period = attendanceRange ? attendanceRange : getWorkPeriodRange(new Date());
    const attendance = await Attendance.find({
        work_date: {
            ...(working_period.range_start && { $gte: working_period.range_start }),
            ...(working_period.range_end && { $lte: working_period.range_end }),
        },
        ...(employee_name && { name: employee_name }),
    })
        .lean()
        .exec();

    if (!attendance || attendance.length === 0) {
        throw new NotFoundException(`employee not found: ${employee_name}`);
    }

    return attendance;
}

async function getEmployeeAttendanceOnMailPlug(
    employee_name?: string,
    attendanceRange?: WorkPeriodRangeProps,
): Promise<AttendanceFields[]> {
    const today = new Date();
    const working_period = attendanceRange ? attendanceRange : getWorkPeriodRange(today);
    const mailplug_data = await getMailPlugData(working_period, employee_name);
    const attendances: AttendanceFields[] = [];

    mailplug_data.forEach((value) => {
        if (value.length === 7) {
            const name = value[1].split(' ')[0];
            const check_in_time: Date = new Date(`${value[0]} ${value[3]}`);
            let isValidCheckOut: boolean;
            let check_out_time: Date;
            if (value[4].includes(')')) {
                isValidCheckOut = false;
                const parts = value[4].split('(');
                const result = parts.flatMap((part) => part.split(')'));
                const finalResult = result.filter((part) => part !== '');
                const month_day = finalResult[0].split('-');
                const time = finalResult[1];

                check_out_time = new Date(`${check_in_time.getFullYear()}-${month_day[0]}-${month_day[1]} ${time}`);
            } else if (value[4] === '-') {
                isValidCheckOut = false;
                check_out_time = new Date(`${value[4]}`);
            } else {
                isValidCheckOut = true;
                check_out_time = new Date(`${value[0]} ${value[4]}`);
            }

            attendances.push({
                check_in_time: Number.isNaN(check_in_time.getTime()) ? undefined : check_in_time,
                check_out_time: Number.isNaN(check_out_time.getTime()) ? undefined : check_out_time,
                name: name,
                state: value[6],
                work_date: new Date(value[0]),
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
    getEmployeeKarma,
};

export default attendanceService;
