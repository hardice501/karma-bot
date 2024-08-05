import express from 'express';
import { readinessStatus } from '../resources/healthChecker';
import attendanceService from '../services/attendance.service';
import { getWorkPeriodRange } from '../utils/date.utils';

const hcRouter = express.Router();

hcRouter.get('/readiness', (req, res) => {
    return res.json({ status: readinessStatus });
});


hcRouter.get('/test/db', async (req, res) => {
    return res.json({ status: await attendanceService.getEmployeeAttendanceOnDb()});
});

hcRouter.get('/test/mailplug', async (req, res) => {
    return res.json({ status: await attendanceService.getEmployeeAttendanceOnMailPlug()});
});

export default hcRouter;
