import MongoConnection from '../resources/karmaCalculator.mongo.connection';

// Admin Models
import AttendanceModel from './employees/attendance.schema'



// Admin Models
export const Attendance = AttendanceModel(MongoConnection);