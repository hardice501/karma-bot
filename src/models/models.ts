import MongoConnection from '../resources/karmaCalculator.mongo.connection';

// Admin Models
import AttendanceModel from './employees/attendance.schema';
import HolidayModel from './holiday/holiday.schema';

// Admin Models
export const Attendance = AttendanceModel(MongoConnection);
export const Holiday = HolidayModel(MongoConnection);
