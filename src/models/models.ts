import MongoConnection from '../resources/karmaCalculator.mongo.connection';

import AttendanceModel from './attendance/attendance.schema';
import HolidayModel from './holiday/holiday.schema';

export const Attendance = AttendanceModel(MongoConnection);
export const Holiday = HolidayModel(MongoConnection);
